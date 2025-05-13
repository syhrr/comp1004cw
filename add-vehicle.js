import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


const supabase = createClient(
  'https://oxinpfpbpvsglksvpnug.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aW5wZnBicHZzZ2xrc3ZwbnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTI1MTgsImV4cCI6MjA1OTA4ODUxOH0.MpFlhTkVXe8nqunU_87cZbf8MQdg8ogJqBbRbU0nIxI'
)



document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submit");
  submitBtn.disabled = true; // Disable Add Owner button if person exists
  submitBtn.style.opacity = "0.5";
  submitBtn.style.pointerEvents = "none";
  submitBtn.style.cursor = "not-allowed";

  const checkBtn = document.getElementById("check-owner");
  const newOwnerBtn = document.getElementById("new-owner");
  newOwnerBtn.disabled = true; // Disable Add Owner button if person exists
  newOwnerBtn.style.opacity = "0.5";
  newOwnerBtn.style.pointerEvents = "none";
  newOwnerBtn.style.cursor = "not-allowed";
  

  const regoInput = document.getElementById("rego");
  const makeInput = document.getElementById("make");
  const modelInput = document.getElementById("model")
  const colourInput = document.getElementById("colour");
  const ownerInput = document.getElementById("owner-id");

  const resultsDiv = document.getElementById("owner-results"); // make sure you have a div#results in HTML

  // Initial state
  updateCheckButtonState(checkBtn);

  // Real-time updates
  ownerInput.addEventListener("input", () => updateCheckButtonState(checkBtn));



  checkBtn.onclick = async function () {
    const driverName = ownerInput.value.trim();
    const exists = await checkForOwner(driverName);
  
    if (exists) {
      await displayOwners(driverName);
      newOwnerBtn.disabled = true; // Disable Add Owner button if person exists
      newOwnerBtn.style.opacity = "0.5";
      newOwnerBtn.style.pointerEvents = "none";
      newOwnerBtn.style.cursor = "not-allowed";
    } else {
      newOwnerBtn.disabled = false; // Enable Add Owner button if no match
      newOwnerBtn.style.opacity = "1";
      newOwnerBtn.style.pointerEvents = "auto";
      newOwnerBtn.style.cursor = "pointer";
      resultsDiv.innerHTML = `<p class="info-text"><h3>Owner not found. Please add them</h3></p>`;
    }
  };


  submitBtn.onclick = async function() 
  {
    if (!areAllInputsFilled()) {
      alert("Please fill in all fields before submitting.");
      return; // stop the function if fields are missing
    }
  
    // If all fields are filled, you can continue with submitting logic
    const rego = regoInput.value.trim();
    const make = makeInput.value.trim();  
    const model = modelInput.value.trim(); 
    const colour = colourInput.value.trim();
    const ownerName = ownerInput.value.trim();

    // Sanity check
    console.log("Vehicle Details:");
    console.log("Registration:", rego);
    console.log("Make:", make);
    console.log("Model:", model);
    console.log("Colour:", colour); 
    // Insert info into Vehicles database
      const { error } = await supabase
    .from('Vehicles')
    .insert({ 
      VehicleID: rego, 
      Make: make,
      Model: model,
      Colour: colour,
      OwnerID: 23
    });

  if (error) {
    console.error('Error adding vehicle:', error);
  } else {
    console.log("Successfully added vehicle with rego:", rego);
  }
  };
  



  function areAllInputsFilled() {
    return (
      regoInput.value.trim() !== "" &&
      makeInput.value.trim() !== "" &&
      colourInput.value.trim() !== "" &&
      ownerInput.value.trim() !== ""
    );


  }
  



  newOwnerBtn.onclick = async function()
  {
    window.location.href = "add-owner.html";
  }

  function updateCheckButtonState(button) {
    const isEmpty = !ownerInput.value.trim();
    button.disabled = isEmpty;
    button.style.opacity = isEmpty ? "0.5" : "1";
    button.style.pointerEvents = isEmpty ? "none" : "auto";
    button.style.cursor = isEmpty ? "not-allowed" : "pointer";
  }
  

  async function checkForOwner(driverName) {
    try {
      const { data, error } = await supabase
        .from('People')
        .select('*')
        .ilike('Name', `%${driverName}%`);

      if (error) {
        console.error('Search error:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Search error:', error);
      return false;
    }
  }



  async function displayOwners(driverName) {
    try {
      const { data, error } = await supabase
        .from('People')
        .select('*')
        .ilike('Name', `%${driverName}%`);
  
      if (error) {
        console.error('Search error:', error);
        return;
      }
  
      resultsDiv.innerHTML = ""; // Clear previous results
  
      let heading = `<h3>Found ${data.length} matching owner(s):</h3>`;
  
      if (data.length > 1) {
        heading += `<p class="info-text">Multiple owners found. Please select the correct owner for the vehicle.</p>`;
      } 

      resultsDiv.innerHTML = `
        ${heading}
        <div class="results-grid">
          ${data.map(owner => `
            <div class="card" data-owner-id="${owner.PersonID}">
              <h4>${owner.Name || 'Unknown'}</h4>
              ${owner.LicenseNumber ? `<p><strong>License number:</strong> ${owner.LicenseNumber}</p>` : ''}
              ${owner.Address ? `<p><strong>Address:</strong> ${owner.Address}</p>` : ''}
              ${owner.DOB ? `<p><strong>Date of Birth:</strong> ${owner.DOB}</p>` : ''}
              ${owner.ExpiryDate ? `<p><strong>Expiry Date:</strong> ${owner.ExpiryDate}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `;
  
      // Attach click events
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
          selectOwner(card);  // Pass the entire card to selectOwner
        });
      });
  
    } catch (error) {
      console.error("Search error:", error);
    }
  }
  
  function selectOwner(card) {
    // Remove 'selected' class from all cards
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.remove('selected'));
  
    // Highlight the selected card
    card.classList.add('selected');
  
    // Set the value of the ownerInput to the name of the selected owner
    const ownerName = card.querySelector('h4').textContent;
    const ownerInput = document.getElementById('owner-id');
    ownerInput.value = ownerName;  // Set the value of the input to the selected owner's name

    // enable submit button if an owner has been selected:

    submitBtn.disabled = false; // Enable Add Owner button if no match
    submitBtn.style.opacity = "1";
    submitBtn.style.pointerEvents = "auto";
    submitBtn.style.cursor = "pointer";
  }
  





  async function addVehicle() {
    
  }




  
  
  


  
});




