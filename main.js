let currentHub = '';
let currentVehicle = '';
let currentContract = '';
let stvCount = 0;
let totalCount = 0;
const scannedIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
    console.log('TC App initialized');

    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Simple validation based on user request
            if (username === 'ca.1234' && password === '1234') {
                const userInfo = document.getElementById('user-info');
                if (userInfo) userInfo.textContent = `Logout (${username})`;
                showView('location-view');
            } else {
                alert('Invalid Credentials! (Try ca.1234 / 1234)');
            }
        });
    }

    const proceedBtn = document.getElementById('proceed-btn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            const vehicleSelect = document.getElementById('vehicle-select');
            const contractSelect = document.getElementById('contract-select');
            const vehicleError = document.getElementById('vehicle-error');

            if (!vehicleSelect.value || !contractSelect.value) {
                if (vehicleError) {
                    vehicleError.textContent = 'Please select both a Vehicle and a Contract type.';
                    vehicleError.style.display = 'block';
                }
                return;
            }
            
            if (vehicleError) vehicleError.style.display = 'none';
            currentContract = contractSelect.value;
            showView('load-building-view');
        });
    }

    const finishBtn = document.getElementById('finish-btn');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            const unpickedCount = 250 - scannedIds.size;
            
            if (unpickedCount === 0) {
                // All items scanned, proceed directly to summary
                const summaryVehicleInput = document.getElementById('summary-vehicle-input');
                if (summaryVehicleInput && currentVehicle) summaryVehicleInput.value = currentVehicle;
                showView('load-summary-view');
            } else {
                // Items pending, show attention modal
                const currentSelectedHub = currentHub || 'MotherHub_STV';
                
                const unpickedElem = document.getElementById('unpicked-units-list');
                if (unpickedElem) {
                    unpickedElem.textContent = `1. ▶ ${currentSelectedHub} (${unpickedCount}):`;
                }
                
                const consignmentsList = document.getElementById('closed-consignments-list');
                if (consignmentsList) {
                    consignmentsList.innerHTML = `<li><strong>${currentSelectedHub}</strong><br>297235400</li>`;
                }

                document.getElementById('attention-modal').style.display = 'flex';
            }
        });
    }

    const sealBtn = document.getElementById('seal-btn');
    if (sealBtn) {
        sealBtn.addEventListener('click', () => {
            const rows = document.querySelectorAll('#seal-rows-container .flex-row');
            let isValid = true;
            
            rows.forEach(row => {
                const input = row.querySelector('input');
                const select = row.querySelector('select');
                if (input && select) {
                    if (!input.value.trim() || select.value === 'Select Seal Type' || select.value === '') {
                        isValid = false;
                        input.style.borderColor = !input.value.trim() ? 'red' : '';
                        select.style.borderColor = (select.value === 'Select Seal Type' || !select.value) ? 'red' : '';
                    } else {
                        input.style.borderColor = '';
                        select.style.borderColor = '';
                    }
                }
            });

            if (!isValid) {
                const sealError = document.getElementById('seal-error');
                if (sealError) {
                    sealError.textContent = 'All fields are required! Please provide a Seal ID and Seal Type for every row.';
                    sealError.style.display = 'block';
                }
            } else {
                const sealError = document.getElementById('seal-error');
                if (sealError) sealError.style.display = 'none';
                
                showView('dockout-view');
            }
        });
    }

    const scanInitBtn = document.getElementById('scan-init-btn');
    const scanInputContainer = document.getElementById('scan-input-container');
    const scanInput = document.getElementById('shipment-scan-input');

    if (scanInitBtn) {
        scanInitBtn.addEventListener('click', () => {
            scanInputContainer.style.display = 'block';
            scanInput.focus();
        });
    }

    if (scanInput) {
        scanInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processScan(scanInput.value);
                scanInput.value = '';
            }
        });
    }

    // Initialize close buttons for alerts
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.info-alert').style.display = 'none';
        });
    });

    updateDepartureTime();
});

function updateDepartureTime() {
    const now = new Date();
    const departure = new Date(now.getTime() + 60 * 60 * 1000); // +60 mins
    
    const day = departure.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[departure.getMonth()];
    
    // Formatting Day Suffix
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    const timeStr = departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const formatted = `${day}${suffix} ${month}, ${timeStr}`;
    
    const elem = document.getElementById('scheduled-departure-time');
    if (elem) elem.textContent = formatted;
}

function resetApp() {
    scannedIds.clear();
    stvCount = 0;
    totalCount = 0;
    currentHub = '';
    currentVehicle = '';
    currentContract = '';
    
    // Reset inputs
    const vehicleSelect = document.getElementById('vehicle-select');
    if (vehicleSelect) vehicleSelect.value = '';
    
    const contractSelect = document.getElementById('contract-select');
    if (contractSelect) contractSelect.value = '';
    
    const summaryAwbInput = document.getElementById('summary-awb-input');
    if (summaryAwbInput) {
        summaryAwbInput.value = '';
        summaryAwbInput.style.borderColor = '';
    }
    
    const scanInput = document.getElementById('shipment-scan-input');
    if (scanInput) scanInput.value = '';
    
    // Hide all validation errors
    const errorIds = ['vehicle-error', 'awb-error', 'seal-error', 'scan-error-msg'];
    errorIds.forEach(id => {
        const err = document.getElementById(id);
        if (err) err.style.display = 'none';
    });
    
    // Reset Seal rows container
    const sealRowsContainer = document.getElementById('seal-rows-container');
    if (sealRowsContainer) {
        sealRowsContainer.innerHTML = `
            <div class="flex-row mb-2">
                <input type="text" placeholder="Enter Seal ID" class="input-std mr-2">
                <select class="select-std">
                    <option>Select Seal Type</option>
                    <option>Bottle Seal</option>
                    <option>Bag Seal</option>
                </select>
                <button class="btn-icon-dark ml-2" onclick="this.parentElement.remove()">🗑️</button>
            </div>
        `;
    }
    
    // Reset Progress
    const countStvElem = document.getElementById('count-stv');
    if (countStvElem) countStvElem.textContent = '0/250';
    const mainProgressText = document.getElementById('main-progress-text');
    if (mainProgressText) mainProgressText.textContent = '0 / 250';
    const mainProgressBar = document.getElementById('main-progress-bar');
    if (mainProgressBar) mainProgressBar.style.width = '0%';
    const weightDisplay = document.getElementById('weight-display');
    if (weightDisplay) weightDisplay.textContent = '0.00kg / 12869.14kg';
    
    renderDynamicShipmentLists();
    
    showView('location-view');
}

function selectLocation(locationName) {
    currentHub = locationName;
    const label = document.getElementById('selected-location-label');
    if (label) label.textContent = locationName;
    showView('vehicle-view');
}

function updateVehicle(vehicleNo) {
    currentVehicle = vehicleNo;
    const summaryVehicleInput = document.getElementById('summary-vehicle-input');
    if (summaryVehicleInput) {
        summaryVehicleInput.value = currentVehicle;
    }
}

function showShipmentDetails(hubName) {
    const breadcrumb = document.getElementById('details-breadcrumb');
    currentContract = document.getElementById('contract-select')?.value || 'Fleet';
    if (breadcrumb) {
        breadcrumb.innerHTML = `<span>${currentHub} > ${currentVehicle || '---'} > ${currentContract} > B2C - LINEHAUL</span>`;
    }
    
    renderDynamicShipmentLists();
    showView('shipment-details-view');
}

function renderDynamicShipmentLists() {
    const pickedContainer = document.getElementById('picked-items-container');
    const expectedContainer = document.getElementById('expected-items-container');
    const pickedCountLabel = document.getElementById('picked-count-label');
    const expectedCountLabel = document.getElementById('expected-count-label');

    if (!pickedContainer || !expectedContainer) return;

    // Clear existing
    pickedContainer.innerHTML = '';
    expectedContainer.innerHTML = '';

    const weights = ['0.20KG', '0.70KG', '0.90KG'];

    // Render Picked
    let i = 1;
    scannedIds.forEach(id => {
        const row = document.createElement('div');
        row.className = 'detail-row';
        const weight = weights[(i - 1) % 3];
        row.innerHTML = `<span>${id}</span><span>${weight}</span>`;
        pickedContainer.appendChild(row);
        i++;
    });
    pickedCountLabel.textContent = `Picked (${scannedIds.size} items)`;

    // Render Expected (Dummy data for remaining)
    const totalExpectedLimit = 250;
    const remainingCount = totalExpectedLimit - scannedIds.size;
    const startIdx = scannedIds.size + 1;
    
    for (let j = 0; j < remainingCount; j++) {
        const row = document.createElement('div');
        row.className = 'detail-row';
        const currentIdx = startIdx + j;
        const dummyId = `FMPPxxxxxxxx${String(currentIdx).padStart(3, '0')}`;
        const weight = weights[(currentIdx - 1) % 3];
        row.innerHTML = `<span>${dummyId}</span><span>${weight}</span>`;
        expectedContainer.appendChild(row);
    }
    
    expectedCountLabel.textContent = `Expected (${remainingCount} items)`;
}

function toggleDetails(listId) {
    const list = document.getElementById(listId);
    if (list) {
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function confirmFinish() {
    closeModal('attention-modal');
    showView('load-summary-view');
}

function addSealRow() {
    const container = document.getElementById('seal-rows-container');
    const newRow = document.createElement('div');
    newRow.className = 'flex-row mb-2';
    newRow.innerHTML = `
        <input type="text" placeholder="Enter Seal ID" class="input-std mr-2">
        <select class="select-std">
            <option>Select Seal Type</option>
            <option>Bottle Seal</option>
            <option>Bag Seal</option>
        </select>
        <button class="btn-icon-dark ml-2" onclick="this.parentElement.remove()">🗑️</button>
    `;
    container.appendChild(newRow);
}

function submitSummary() {
    const awbInput = document.getElementById('summary-awb-input');
    const awbError = document.getElementById('awb-error');
    if (!awbInput || !awbInput.value.trim()) {
        if (awbError) {
            awbError.textContent = 'AWB is required. Please enter AWB.';
            awbError.style.display = 'block';
        }
        if (awbInput) awbInput.style.borderColor = 'red';
        return;
    }
    
    if (awbError) awbError.style.display = 'none';
    if (awbInput) awbInput.style.borderColor = '';
    showView('sealing-view');
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        if (viewId === 'login-view') {
            userInfo.style.display = 'none';
        } else {
            userInfo.style.display = 'block';
        }
    }

    // Update breadcrumbs based on view
    updateBreadcrumbs(viewId);

    // Handle view-specific dynamic rendering
    if (viewId === 'load-summary-view') {
        const summaryBody = document.getElementById('summary-load-details-body');
        if (summaryBody) {
            const currentSelectedHub = currentHub || 'MotherHub_STV';
            const totalScanned = scannedIds.size;
            const semiLargeCount = Math.ceil(totalScanned / 2);
            const bagCount = Math.floor(totalScanned / 2);

            summaryBody.innerHTML = `
                <tr>
                    <td>${currentSelectedHub}</td>
                    <td>SEMI LARGE SHIPMENT: ${semiLargeCount}<br>BAG: ${bagCount}</td>
                </tr>
            `;
        }
    }

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    } else {
        console.error(`View ${viewId} not found`);
    }
}

function updateBreadcrumbs(viewId) {
    if (!currentHub) return; // Guard for login screen or early views
    currentContract = document.getElementById('contract-select')?.value || 'FLEET';
    const breadcrumbText = `${currentHub} > ${currentVehicle || '---'} > ${currentContract} > B2C - LINEHAUL`;
    
    const viewsWithBreadcrumbs = {
        'load-building-view': document.querySelector('#load-building-view .breadcrumb'),
        'shipment-details-view': document.querySelector('#shipment-details-view .breadcrumb'),
        'load-summary-view': document.querySelector('#load-summary-view .breadcrumb'),
        'sealing-view': document.querySelector('#sealing-view .breadcrumb'),
        'dockout-view': document.querySelector('#dockout-view .breadcrumb')
    };

    if (viewsWithBreadcrumbs[viewId]) {
        let suffix = '';
        if (viewId === 'sealing-view') suffix = ' > SEALING';
        if (viewId === 'dockout-view') suffix = ' > SEALING > DOCKOUT';
        viewsWithBreadcrumbs[viewId].textContent = breadcrumbText + suffix;
    }
}

function processScan(shipmentId) {
    const errorMsg = document.getElementById('scan-error-msg');
    const isRemove = document.getElementById('remove-chk')?.checked;
    if (errorMsg) errorMsg.style.display = 'none';

    if (!shipmentId) return;

    if (isRemove) {
        if (!scannedIds.has(shipmentId)) {
            if (errorMsg) {
                errorMsg.textContent = 'Shipment ID not found for removal';
                errorMsg.style.display = 'block';
            }
            return;
        }
        scannedIds.delete(shipmentId);
        stvCount = Math.max(0, stvCount - 1);
    } else {
        if (scannedIds.has(shipmentId)) {
            if (errorMsg) {
                errorMsg.textContent = 'Shipement ID is Already Added';
                errorMsg.style.display = 'block';
            }
            return;
        }
        scannedIds.add(shipmentId);
        if (stvCount >= 250) {
            if (errorMsg) {
                errorMsg.textContent = 'Wrong Shipment Scanned';
                errorMsg.style.display = 'block';
            }
            return;
        }
        stvCount++;
    }

    totalCount = stvCount;

    // Update UI
    const countStvElem = document.getElementById('count-stv');
    if (countStvElem) countStvElem.textContent = `${stvCount}/250`;
    
    const mainProgressText = document.getElementById('main-progress-text');
    const mainProgressBar = document.getElementById('main-progress-bar');
    
    if (mainProgressText) mainProgressText.textContent = `${totalCount} / 250`;
    if (mainProgressBar) {
        const percentage = (totalCount / 250) * 100;
        mainProgressBar.style.width = `${percentage}%`;
    }

    // Update weight (dummy logic: +0.5kg per scan)
    const weightDisplay = document.getElementById('weight-display');
    if (weightDisplay) {
        const currentWeight = (totalCount * 0.5).toFixed(2);
        weightDisplay.textContent = `${currentWeight}kg / 12869.14kg`;
    }
}
