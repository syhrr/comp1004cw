import supabase from './supabase.js';

document.addEventListener("DOMContentLoaded", () => {
  // Element references
  const submitBtn = document.getElementById("submit");
  const checkBtn = document.getElementById("check-owner");
  const newOwnerBtn = document.getElementById("new-owner");
  const regoInput = document.getElementById("rego");
  const makeInput = document.getElementById("make");
  const modelInput = document.getElementById("model");
  const colourInput = document.getElementById("colour");
  const ownerInput = document.getElementById("owner-id");
  const resultsDiv = document.getElementById("owner-results");
  const messageDiv = document.getElementById("message") || document.createElement("div");
  
  if (!messageDiv.id) {
    messageDiv.id = "message";
    messageDiv.style.margin = "20px 0";
    document.querySelector('form').appendChild(messageDiv);
  }
  
  // Initial button states
  disableButton(submitBtn);
  disableButton(newOwnerBtn);
  updateCheckButtonState();
  
  // Event listeners
  ownerInput.addEventListener("input", updateCheckButtonState);
  checkBtn.addEventListener("click", checkOwner);
  newOwnerBtn.addEventListener("click", () => window.location.href = "add-owner.html");
  submitBtn.addEventListener("click", handleSubmit);
  
  // Utility functions
  function disableButton(button) {
    button.disabled = true;
    button.style.opacity = "0.5";
    button.style.pointerEvents = "none";
    button.style.cursor = "not-allowed";
  }
  
  function enableButton(button) {
    button.disabled = false;
    button.style.opacity = "1";
    button.style.pointerEvents = "auto";
    button.style.cursor = "pointer";
  }
  
  function updateCheckButtonState() {
    const isEmpty = !ownerInput.value.trim();
    if (isEmpty) {
      disableButton(checkBtn);
    } else {
      enableButton(checkBtn);
    }
  }
  
  function showMessage(text, isError = false) {
    messageDiv.textContent = text;
    messageDiv.style.color = isError ? "red" : "green";
    messageDiv.style.padding = "10px";
    messageDiv.style.border = `1px solid ${isError ? "red" : "green"}`;
    messageDiv.style.borderRadius = "4px";
  }
  
  function clearMessage() {
    messageDiv.textContent = "";
    messageDiv.style.padding = "0";
    messageDiv.style.border = "none";
  }
  
  function areAllFieldsFilled() {
    return (
      regoInput.value.trim() !== "" &&
      makeInput.value.trim() !== "" &&
      modelInput.value.trim() !== "" &&
      colourInput.value.trim() !== "" &&
      ownerInput.value.trim() !== ""
    );
  }
  
  // Main functionality
  async function checkOwner() {
    const driverName = ownerInput.value.trim();
    clearMessage();
    
    try {
      const { data, error } = await supabase
        .from('People')
        .select('*')
        .ilike('Name', `%${driverName}%`);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        displayOwners(data);
        disableButton(newOwnerBtn);
      } else {
        resultsDiv.innerHTML = `<p class="info-text"><h3>Owner not found. Please add them</h3></p>`;
        enableButton(newOwnerBtn);
      }
    } catch (error) {
      console.error('Error checking owner:', error);
      showMessage(`Error: ${error.message || 'Failed to check owner'}`, true);
    }
  }
  
  function displayOwners(owners) {
    resultsDiv.innerHTML = "";
    
    let heading = `<h3>Found ${owners.length} matching owner(s):</h3>`;
    if (owners.length > 1) {
      heading += `<p class="info-text">Multiple owners found. Please select the correct owner.</p>`;
    }
    
    const ownerCards = owners.map(owner => `
      <div class="card" data-owner-id="${owner.PersonID}">
        <h4>${owner.Name || 'Unknown'}</h4>
        ${owner.LicenseNumber ? `<p><strong>License:</strong> ${owner.LicenseNumber}</p>` : ''}
        ${owner.Address ? `<p><strong>Address:</strong> ${owner.Address}</p>` : ''}
        ${owner.DOB ? `<p><strong>DOB:</strong> ${owner.DOB}</p>` : ''}
      </div>
    `).join('');
    
    resultsDiv.innerHTML = `
      ${heading}
      <div class="results-grid">${ownerCards}</div>
    `;
    
    // Add click handlers
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => selectOwner(card));
    });
  }
  
  function selectOwner(card) {
    // Update UI
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    
    // Set owner name in input
    const ownerName = card.querySelector('h4').textContent;
    ownerInput.value = ownerName;
    
    // Enable submit button
    enableButton(submitBtn);
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!areAllFieldsFilled()) {
      showMessage("Please fill in all fields", true);
      return;
    }
    
    const selectedCard = document.querySelector('.card.selected');
    if (!selectedCard) {
      showMessage("Please select an owner from the list", true);
      return;
    }
    
    const ownerId = selectedCard.dataset.ownerId;
    const rego = regoInput.value.trim();
    const make = makeInput.value.trim();
    const model = modelInput.value.trim();
    const colour = colourInput.value.trim();
    
    try {
      // Check for existing vehicle
      const { data: existingVehicle } = await supabase
        .from('Vehicles')
        .select('*')
        .eq('VehicleID', rego)
        .maybeSingle();
      
      if (existingVehicle) {
        showMessage(`Vehicle with registration ${rego} already exists`, true);
        return;
      }
      
      // Insert new vehicle
      const { data, error } = await supabase
        .from('Vehicles')
        .insert({
          VehicleID: rego,
          Make: make,
          Model: model,
          Colour: colour,
          OwnerID: ownerId
        })
        .select();
      
      if (error) throw error;
      
      // Success
      showMessage(`Vehicle ${rego} added successfully!`);
      
      // Clear the form
      regoInput.value = '';
      makeInput.value = '';
      modelInput.value = '';
      colourInput.value = '';
      ownerInput.value = '';
      resultsDiv.innerHTML = '';
      disableButton(submitBtn);
      updateCheckButtonState();
      
      // Optional: redirect after short delay
      /*
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
      */
      
    } catch (error) {
      console.error('Error:', error);
      showMessage(`Error: ${error.message || 'Failed to add vehicle'}`, true);
    }
  }
});
