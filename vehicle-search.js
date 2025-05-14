import supabase from './supabase.js';

document.addEventListener("DOMContentLoaded", () => {
  const submitVehicleBtn = document.getElementById("submit");
  const resultsDiv = document.getElementById("results");
  const messageDiv = document.getElementById("message");
  const licenseInput = document.getElementById("license");

  submitVehicleBtn.onclick = async function () {
  clearMessage(messageDiv);
  resultsDiv.innerHTML = '';

  const regNum = licenseInput.value.trim().toUpperCase();

  if (!regNum) {
    showMessage(messageDiv, "Please enter a valid license number.", true);
    return;
  }

  try {
    let { data: vehicles, error } = await supabase
      .from('Vehicles')
      .select(`*, People (*)`)
      .or(`LicenseNumber.eq.${regNum},LicenseNumber.ilike.%${regNum}%`); // Fix column name

    if (error) throw error;

    displayVehicleResults(vehicles);
  } catch (error) {
    console.error('Supabase query error:', error.message);
    showMessage(messageDiv, "An error occurred while searching.", true);
  }
};


  function displayVehicleResults(vehicles) {
    if (!vehicles || vehicles.length === 0) {
      showMessage(messageDiv, "No vehicles with that license number are in the database.", true);
      return;
    }

    showMessage(messageDiv, "Search successful!");

    resultsDiv.innerHTML = `
      <h3>Found ${vehicles.length} matching record(s):</h3>
      <div class="results-grid">
        ${vehicles.map(vehicle => `
          <div class="card">
            <h4>${vehicle.VehicleID || 'Unknown'}</h4>
            ${vehicle.Make ? `<p><strong>Make:</strong> ${vehicle.Make}</p>` : ''}
            ${vehicle.Colour ? `<p><strong>Colour:</strong> ${vehicle.Colour}</p>` : ''}

            ${
              vehicle.OwnerID !== null
                ? `
                  ${vehicle.People?.Name ? `<p><strong>Driver name:</strong> ${vehicle.People.Name}</p>` : ''}
                  ${vehicle.People?.LicenseNumber ? `<p><strong>Licence number:</strong> ${vehicle.People.LicenseNumber}</p>` : ''}
                `
                : `<p><strong class="no-driver">No driver assigned!</strong></p>`
            }
          </div>
        `).join('')}
      </div>
    `;
  }

  function showMessage(target, text, isError = false) {
    target.textContent = text;
    target.className = `message ${isError ? 'error' : 'success'}`;
  }

  function clearMessage(target) {
    target.textContent = '';
    target.className = 'message';
  }
});
