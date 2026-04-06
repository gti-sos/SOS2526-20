<script>
	// @ts-ignore
	let wools = $state([]);
	let loadStatus = $state(null);
	let loadMessage = $state('');
	let selectedWool = $state(null);
	let offset = 0;
	let limit = 10;
	let total = 0;

	let searchFilters = $state({
		from: null,
		to: null,
		reporterdesc: '',
		flowdesc: '',
		qtyunitabbr: '',
		qty: null,
		isqtyestimated: '',
		netwgt: null,
		isnetwgtestimated: '',
		grosswgt: null,
		isgrosswgtestimated: '',
		cifvalue: null,
		fobvalue: null,
		primaryvalue: null
	});
	let newWool = $state({
		period: null,
		reporterdesc: '',
		flowdesc: '',
		qtyunitabbr: '',
		qty: null,
		isqtyestimated: '',
		netwgt: null,
		isnetwgtestimated: '',
		grosswgt: null,
		isgrosswgtestimated: '',
		cifvalue: null,
		fobvalue: null,
		primaryvalue: null
	});
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';

	let API = '/api/v2/wool-stats';
	let resultStatusCode = $state(0);
	if (dev) API = 'http://localhost:3000' + API;

	// --- ESTADO DE NOTIFICACIONES (Svelte 5 Runes) ---
	let notificationMessage = $state('');
	let notificationType = $state('success'); // Puede ser "success" o "error"
	let notificationTimeout = $state(null);

	// Función para mostrar mensajes al usuario (desaparecen a los 5 segundos)
	function showMessage(message, type = 'success') {
		notificationMessage = message;
		notificationType = type;

		if (notificationTimeout) clearTimeout(notificationTimeout);
		notificationTimeout = setTimeout(() => {
			notificationMessage = '';
		}, 5000);
	}

	// Función centralizada para manejar errores de la API
	async function handleApiError(err, defaultMessage) {
		console.error('Error en API:', err);

		// 1. PRIORIDAD MÁXIMA: El mensaje que entra por parámetro
		let userMessage = defaultMessage;

		// 2. Si NO hay mensaje por defecto, evaluamos el tipo de error HTTP
		if (!userMessage && err instanceof Response) {
			const status = err.status;
            //holamundo
			if (status === 404) {
				userMessage =
					'No se encontró el recurso. Es posible que no exista o haya sido borrado previamente.';
			} else if (status === 409) {
				userMessage = 'Hubo un conflicto: este registro ya existe en el sistema.';
			} else if (status === 400) {
				userMessage =
					'Los datos introducidos no son válidos. Por favor, revisa el formulario e inténtalo de nuevo.';
			} else if (status === 401 || status === 403) {
				userMessage =
					'No tienes permisos suficientes o tu sesión ha caducado. Vuelve a iniciar sesión.';
			} else if (status >= 500) {
				userMessage =
					'Ha ocurrido un problema interno en el servidor. Por favor, inténtalo de nuevo más tarde.';
			}
		}

		// 3. FALLBACK FINAL: Si no hay mensaje por defecto y tampoco es un error HTTP manejado
		// (por ejemplo, si se cae el internet y el fetch falla antes de recibir respuesta)
		if (!userMessage) {
			userMessage = 'Ocurrió un error inesperado de comunicación.';
		}

		// Mostramos el mensaje final en la UI
		showMessage(userMessage, 'error');
	}

	async function getWools(newLimit = limit, newOffset = offset, currentFilters = searchFilters) {
		try {
			// Inicializamos el constructor de parámetros para la URL
			const params = new URLSearchParams();

			// Añadir paginación
			params.append('limit', newLimit);
			params.append('offset', newOffset);

			let hasFilters = false; 

			// Iterar sobre el objeto de filtros y añadir solo los que tengan valor
			for (const key in currentFilters) {
				const value = currentFilters[key];

				// Ignoramos cadenas vacías, nulos o indefinidos
				if (value !== null && value !== undefined && value !== '') {
					params.append(key, value);
                    hasFilters = true;
				}
			}

			// Realizar la petición dinámica a la API de lanas
			const res = await fetch(`${API}?${params.toString()}`);

			if (!res.ok) throw res; // Lanza el error al catch si hay fallo

			const data = await res.json();

			if (data.data.length === 0 && hasFilters) {
                 // Usamos tu manejador de errores global en lugar de alert
                handleApiError(null, "No se encontraron lanas con los criterios de búsqueda aplicados.");
            }
			if (data.data.length !== 0){
                showMessage("Se muestran los datos.");
            }
			// Actualizar variables de estado globales
			wools = data.data;
			total = data.total;
			limit = data.limit;
			offset = data.offset;

		} catch (err) {
			handleApiError(err, 'No se pudo cargar la lista filtrada de lanas.');
		}
	}
	async function deleteAllWools() {
		try {
			const res = await fetch(API, { method: 'DELETE' });
			if (!res.ok) throw res;

			showMessage('Todos los registros han sido borrados con éxito.');
			await getWools();
		} catch (err) {
			handleApiError(err, 'Error al intentar borrar todos los registros.');
		}
	}

	async function loadInitialData() {
		try {
			const res = await fetch(API + '/loadInitialData');
			if (!res.ok) throw res;

			const data = await res.json();
			showMessage(data.message || 'Datos iniciales cargados correctamente.');
			await getWools();
		} catch (err) {
			handleApiError(err, 'No se pudieron cargar los datos iniciales del servidor.');
		}
	}

	async function postWool(event) {
		event.preventDefault(); // Evita que la página se recargue

		try {
			const res = await fetch(API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newWool)
			});

			if (!res.ok) throw res; // Captura 400, 409, 500...

			showMessage('Lana añadida exitosamente.');
			await getWools(); // Refresca la tabla

			// RESETEO DEL FORMULARIO
			newWool = {
				period: null,
				reporterdesc: '',
				flowdesc: '',
				qtyunitabbr: '',
				qty: null,
				isqtyestimated: '',
				netwgt: null,
				isnetwgtestimated: '',
				grosswgt: null,
				isgrosswgtestimated: '',
				cifvalue: null,
				fobvalue: null,
				primaryvalue: null
			};
		} catch (err) {
			handleApiError(err, 'Ocurrió un error al intentar guardar la nueva lana.');
		}
	}

	async function deleteWool(period, reporterdesc, flowdesc) {
		try {
			const res = await fetch(`${API}/${period}/${reporterdesc}/${flowdesc}`, {
				method: 'DELETE'
			});

			if (!res.ok) throw res;

			showMessage(`Registro de ${reporterdesc} borrado con éxito.`);
			await getWools();
		} catch (err) {
			handleApiError(err, `Error al intentar borrar el registro de ${reporterdesc}.`);
		}
	}

	async function getSingleWool(period, reporterdesc, flowdesc) {
		try {
			const res = await fetch(`${API}/${period}/${reporterdesc}/${flowdesc}`, {
				method: 'GET'
			});

			if (!res.ok) throw res;

			const data = await res.json();
			selectedWool = data;
		} catch (err) {
			selectedWool = null;
			handleApiError(
				err,
				`No se pudo obtener la información específica de ${reporterdesc} para el año ${period}.`
			);
		}
	}


	async function handleDeleteWool() {
		const period = document.getElementById('delPeriod').value;
		const reporterdesc = document.getElementById('delReporterdesc').value;
		const flowdesc = document.getElementById('delFlowdesc').value;
		deleteWool(period, reporterdesc, flowdesc);
	}

	async function handleGetSingleWool() {
		const period = document.getElementById('getSinglePeriod').value;
		const reporterdesc = document.getElementById('getSingleReporterdesc').value;
		const flowdesc = document.getElementById('getSingleFlowdesc').value;
		getSingleWool(period, reporterdesc, flowdesc);
	}
	onMount(() => {
		getWools();
	});

	function handlePrimPag() {
		offset = 0;
		getWools(limit, offset);
	}

	function handleMasPag() {
		if (offset + limit < total) {
			offset += limit;
			getWools(limit, offset);
		}
	}

	function handleMenosPag() {
		if (offset - limit >= 0) {
			offset -= limit;
			getWools(limit, offset);
		}
	}

	function handleUlPag() {
		offset = Math.floor((total - 1) / limit) * limit;
		getWools(limit, offset);
	}


	function handleSearch() {
		offset = 0; // Al buscar, siempre queremos empezar desde la primera página
		getWools(limit, offset, searchFilters);
	}
	function clearSearch() {
		// Reseteamos todos los filtros
		searchFilters = {
			from: null,
			to: null,
			reporterdesc: '',
			flowdesc: '',
			qtyunitabbr: '',
			qty: null,
			isqtyestimated: '',
			netwgt: null,
			isnetwgtestimated: '',
			grosswgt: null,
			isgrosswgtestimated: '',
			cifvalue: null,
			fobvalue: null,
			primaryvalue: null
		};
		offset = 0;
		getWools(); // Volvems a cargar sin filtros
	}
</script>

<div class="container">
	<header>
		<h1>Estadisticas de lana</h1>
		<p class="subtitle">Gestión de inventario y producción global</p>
	</header>

	<main>
		{#if notificationMessage}
			<div
				class="notification {notificationType === 'error' ? 'error-banner' : 'success-banner'}"
				role="alert"
			>
				<p>{notificationMessage}</p>
				<button onclick={() => (notificationMessage = '')}>✖</button>
			</div>
		{/if}
		<section class="card">
			<h3>+ Añadir Nuevo Registro</h3>
			<form onsubmit={postWool} class="grid-form">
				<div class="field">
					<label for="period">Año</label>
					<input
						id="period"
						type="number"
						bind:value={newWool.period}
						placeholder="Ej. 2014"
						required
					/>
				</div>

				<div class="field">
					<label for="reporterdesc">Pais</label>
					<input
						id="reporterdesc"
						type="text"
						bind:value={newWool.reporterdesc}
						placeholder="Ej. España"
						required
					/>
				</div>

				<div class="field">
					<label for="flowdesc">Importación/Exportación</label>
					<input
						id="flowdesc"
						type="text"
						bind:value={newWool.flowdesc}
						placeholder="Ej. Importación"
						required
					/>
				</div>

				<div class="field">
					<label for="qtyunitAbbr">Unidad de Medida</label>
					<input
						id="qtyunitAbbr"
						type="text"
						step="any"
						bind:value={newWool.qtyunitabbr}
						required
					/>
				</div>

				<div class="field">
					<label for="qty">Cantidad</label>
					<input id="qty" type="number" step="any" bind:value={newWool.qty} required />
				</div>

				<div class="field">
					<label for="isqtyestimated">¿Está la cantidad estimada?</label>
					<input
						id="isqtyestimated"
						type="text"
						step="any"
						bind:value={newWool.isqtyestimated}
						required
					/>
				</div>

				<div class="field">
					<label for="netwgt">Cantidad exacta</label>
					<input id="netwgt" type="number" step="any" bind:value={newWool.netwgt} required />
				</div>

				<div class="field">
					<label for="isnetwgtestimated">¿Está la cantidad exacta estimada?</label>
					<input
						id="isnetwgtestimated"
						type="text"
						step="any"
						bind:value={newWool.isnetwgtestimated}
						required
					/>
				</div>

				<div class="field">
					<label for="grosswgt">Peso Bruto</label>
					<input id="grosswgt" type="number" step="any" bind:value={newWool.grosswgt} required />
				</div>

				<div class="field">
					<label for="isgrosswgtestimated">¿Está el peso bruto estimado?</label>
					<input
						id="isgrosswgtestimated"
						type="text"
						step="any"
						bind:value={newWool.isgrosswgtestimated}
						required
					/>
				</div>

				<div class="field">
					<label for="cifvalue">Valor CIF</label>
					<input id="cifvalue" type="number" step="any" bind:value={newWool.cifvalue} required />
				</div>

				<div class="field">
					<label for="fobvalue">Valor FOB</label>
					<input id="fobvalue" type="number" step="any" bind:value={newWool.fobvalue} required />
				</div>

				<div class="field">
					<label for="primaryvalue">Valor Primario</label>
					<input
						id="primaryvalue"
						type="number"
						step="any"
						bind:value={newWool.primaryvalue}
						required
					/>
				</div>

				<div class="field full-width">
					<button type="submit" class="btn-primary" id="btnAddNew">Guardar Registro</button>
				</div>
			</form>
		</section>

		<section class="card">
			<h3>Borrar un Dato</h3>
			<form
				class="grid-form"
				id="delForm"
				onsubmit={(e) => {
					e.preventDefault();
					handleDeleteWool();
				}}
			>
				<div class="field">
					<label for="delPeriod">Año:</label>
					<input type="number" id="delPeriod" name="delPeriod" required />
				</div>
				<div class="field">
					<label for="delReporterdesc">País:</label>
					<input type="text" id="delReporterdesc" name="delReporterdesc" required />
				</div>
				<div class="field">
					<label for="delFlowdesc">Importación o Exportación:</label>
					<input type="text" id="delFlowdesc" name="delFlowdesc" required />
				</div>
				<button type="submit" id="btnDel" value="submit" class="btn-danger">Eliminar</button>
			</form>
		</section>
		<section class="card">
			<h3>Recuperar un dato específico</h3>
			<form
				class="grid-form"
				id="getSingleForm"
				onsubmit={(e) => {
					e.preventDefault();
					handleGetSingleWool();
				}}
			>
				<div class="field">
					<label for="getSinglePeriod">Periodo:</label>
					<input type="number" id="getSinglePeriod" name="getSinglePeriod" required />
				</div>
				<div class="field">
					<label for="getSingleReporterdesc">País:</label>
					<input type="text" id="getSingleReporterdesc" name="getSingleReporterdesc" required />
				</div>
				<div class="field">
					<label for="getSingleFlowdesc">Importación o Exportación:</label>
					<input type="text" id="getSingleFlowdesc" name="getSingleFlowdesc" required />
				</div>
				<button type="submit" id="btnGetSingle" value="submit" class="btn-secondary">Buscar</button>
			</form>
			{#if selectedWool}
				<div class="card">
					<h4>Resultado</h4>

					{#each Object.entries(selectedWool) as [key, value]}
						<div class="row">
							<span class="key">{key}:</span>
							<span class="value">{value}</span>
						</div>
					{/each}
				</div>
			{/if}
		</section>
		<section class="card">
			<h3>🔍 Filtrar Registros</h3>
			<div class="filter-section">
				<div class="grid-form">

					<div class="field">
						<label for="filterFromPeriod">Desde el Año</label>
						<input id="filterFromPeriod" type="number" bind:value={searchFilters.from} placeholder="Ej. 2014" />
					</div>

					<div class="field">
						<label for="filterToPeriod">Hasta el Año</label>
						<input id="filterToPeriod" type="number" bind:value={searchFilters.to} placeholder="Ej. 2016" />
					</div>

					<div class="field">
						<label for="filterReporterdesc">Pais</label>
						<input
							id="filterReporterdesc"
							type="text"
							bind:value={searchFilters.reporterdesc}
							placeholder="Ej. España"
						/>
					</div>

					<div class="field">
						<label for="filterFlowdesc">Importación/Exportación</label>
						<input
							id="filterFlowdesc"
							type="text"
							bind:value={searchFilters.flowdesc}
							placeholder="Ej. Import"
						/>
					</div>

					<div class="field">
						<label for="filterQtyunitabbr">Unidad de Medida</label>
						<input id="filterQtyunitabbr" type="text" bind:value={searchFilters.qtyunitabbr} />
					</div>

					<div class="field">
						<label for="filterQty">Cantidad</label>
						<input id="filterQty" type="number" bind:value={searchFilters.qty} />
					</div>

					<div class="field">
						<label for="filterIsqtyestimated">¿Está la cantidad estimada?</label>
						<input
							id="filterIsqtyestimated"
							type="text"
							bind:value={searchFilters.isqtyestimated}
						/>
					</div>

					<div class="field">
						<label for="filterNetwgt">Cantidad exacta</label>
						<input id="filterNetwgt" type="number" bind:value={searchFilters.netwgt} />
					</div>

					<div class="field">
						<label for="filterIsnetwgtestimated">¿Está la cantidad exacta estimada?</label>
						<input
							id="filterIsnetwgtestimated"
							type="text"
							bind:value={searchFilters.isnetwgtestimated}
						/>
					</div>

					<div class="field">
						<label for="filterGrosswgt">Peso Bruto</label>
						<input id="filterGrosswgt" type="number" bind:value={searchFilters.grosswgt} />
					</div>

					<div class="field">
						<label for="filterIsgrosswgtestimated">¿Está el peso bruto estimado?</label>
						<input
							id="filterIsgrosswgtestimated"
							type="text"
							bind:value={searchFilters.isgrosswgtestimated}
						/>
					</div>

					<div class="field">
						<label for="filterCifvalue">Valor CIF</label>
						<input id="filterCifvalue" type="number" bind:value={searchFilters.cifvalue} />
					</div>

					<div class="field">
						<label for="filterFobvalue">Valor FOB</label>
						<input id="filterFobvalue" type="number" bind:value={searchFilters.fobvalue} />
					</div>

					<div class="field">
						<label for="filterPrimaryvalue">Valor Primario</label>
						<input
							id="filterPrimaryvalue"
							type="number"
							bind:value={searchFilters.primaryvalue}
						/>
					</div>
					<div class="actions" style="margin-top: 1.5rem; display: flex; gap: 1rem;">
						<button class="btn-primary" data-testid="btnSearchFilters" onclick={handleSearch} id="btnSearch">🔍 Buscar</button>
						<button class="btn-secondary" onclick={clearSearch} id="btnSweepSearch">Sweep Filtros</button>
					</div>
				</div>
			</div>
		</section>
		<section class="card">
			<div class="table-header">
				<h3>Listado de Datos</h3>
				<div class="actions">
					<button onclick={getWools} class="btn-secondary" id="btnRefresh">🔄 Actualizar</button>
					<button onclick={loadInitialData} class="btn-secondary" id="btnLoadInitialData">📥 Cargar Base de datos inicial</button>
					<button onclick={deleteAllWools} class="btn-danger" id="btnDeleteAll">🗑️ Borrar Todo</button>
				</div>
			</div>

			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Periodo</th>
							<th>Pais</th>
							<th>Importacion o exportacion</th>
						</tr>
					</thead>
					<tbody>
						{#each wools as wool (`${wool.period}-${wool.reporterdesc}-${wool.flowdesc}`)}
							<tr data-testid="woolRow">
								<td><strong>{wool.period}</strong></td>
								<td><span class="badge">{wool.reporterdesc}</span></td>
								<td>{wool.flowdesc}</td>
								<td
									><a
										href="/wool-stats/{wool.period}/{encodeURIComponent(
											wool.reporterdesc
										)}/{encodeURIComponent(wool.flowdesc)}">Editar</a
									></td
								>
							</tr>
						{:else}
							<tr>
								<td colspan="4" style="text-align: center; padding: 2rem; color: #888;">
									No hay datos disponibles. Haz clic en "Cargar Base".
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<button onclick={handlePrimPag} id="btnPrimeraPag">Primera Página</button>
				<button onclick={handleMenosPag} id="btnRetroceder">Retroceder Página</button>
				<button onclick={handleMasPag} id="btnAdelantar">Avanzar página</button>
				<button onclick={handleUlPag} id="btnUltimaPag">Última Página</button>
			</div>
		</section>
	</main>
</div>

<style>
	:global(body) {
		background-color: #e8f1ff; /* azul muy claro */
		font-family:
			'Segoe UI',
			system-ui,
			-apple-system,
			sans-serif;
		color: #0d1b2a;
		margin: 0;
		padding: 20px;
	}

	.container {
		max-width: 1000px;
		margin: 0 auto;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
	}

	h1 {
		color: #1b263b; /* azul profundo */
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #415a77; /* azul grisáceo */
		margin-top: 0;
	}

	.card {
		background: #f0f6ff; /* azul muy suave */
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 8px rgba(27, 38, 59, 0.15);
		margin-bottom: 2rem;
		border: 1px solid #c7d7f0;
	}

	/* Formulario en Grid */
	.grid-form {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.2rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.full-width {
		grid-column: 1 / -1;
	}

	label {
		font-size: 0.85rem;
		font-weight: bold;
		color: #1b263b;
	}

	input {
		padding: 0.6rem;
		border: 1px solid #a9c3e8;
		border-radius: 6px;
		font-size: 1rem;
		background-color: #f8fbff;
	}

	input:focus {
		outline: none;
		border-color: #4a90e2;
		box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.35);
	}

	/* Botones */
	button {
		cursor: pointer;
		border: none;
		border-radius: 6px;
		padding: 0.6rem 1.2rem;
		font-weight: 600;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #1e5cff; /* azul potente */
		color: white;
		width: 100%;
	}

	.btn-primary:hover {
		background: #003bb8;
	}

	.btn-secondary {
		background: #dce7ff;
		color: #1b263b;
	}

	.btn-secondary:hover {
		background: #c3d6ff;
	}

	.btn-danger {
		background: #ffe6e6;
		color: #b00020;
	}

	.btn-danger:hover {
		background: #ffd1d1;
	}

	/* Tabla */
	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	th {
		background: #e3edff;
		padding: 1rem;
		border-bottom: 2px solid #c7d7f0;
		font-size: 0.9rem;
		text-transform: uppercase;
		color: #1b263b;
	}

	td {
		padding: 1rem;
		border-bottom: 1px solid #dce7ff;
	}

	tr:hover {
		background-color: #f2f7ff;
	}

	.badge {
		background: #dce7ff;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.8rem;
		color: #1b263b;
	}

	/* Notificaciones */
	.notification {
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 6px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.success-banner {
		background-color: #e6f4ff;
		color: #0b4f8a;
		border: 1px solid #bcdcff;
	}

	.error-banner {
		background-color: #ffe6e6;
		color: #b00020;
		border: 1px solid #ffcccc;
	}

	.notification button {
		background: none;
		border: none;
		cursor: pointer;
		font-weight: bold;
		color: inherit;
	}
</style>
