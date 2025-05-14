import supabase from './supabase.js';

document.addEventListener("DOMContentLoaded", () => {
  const submitVehicleBtn = document.getElementById("submit");
  const resultsDiv = document.getElementById("results");
  const messageDiv = document.getElementById("message");
  const licenseInput = document.getElementById("license")


  submitVehicleBtn.onclick = async function() {
    try {
      const regNum = licenseInput.value.trim().toUpperCase();

      if (!regNum) {
        messageDiv.innerHTML = `<h3>Error</h3>`
        return;
      }

      // First try exact match with driver information
      let { data: vehicles, error } = await supabase
        .from('Vehicles')
        .select(`
          *,
          People (*)
        `)
        .or(`VehicleID.eq.${regNum},VehicleID.ilike.%${regNum}%`);

      if (error) throw error;



      // Display results with driver info
      displayVehicleResults(vehicles);
      
    } catch (error) {
      console.error('Search error:', error);
    
    }
  };

  function displayVehicleResults(vehicles) {
    if (vehicles.length == 0){
      messageDiv.innerHTML = `<h3>No vehicles with that license number are in the database!</h3>`
    } else {
       messageDiv.innerHTML = `<h3>Search successful</h3>`
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
  }
});
