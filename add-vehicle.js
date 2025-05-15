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
  const ownerInput = document.getElementById("owner");
  const resultsDiv = document.getElementById("owner-results");
  const messageDiv = document.getElementById("message-vehicle");

  // Track selected card globally
  let selectedCard = null;

  // Restore saved vehicle data from sessionStorage if any, then clear storage
  // Restore saved vehicle data from sessionStorage if any, then clear storage
if (sessionStorage.getItem('vehicleRego')) {
  regoInput.value = sessionStorage.getItem('vehicleRego');
  sessionStorage.removeItem('vehicleRego');
}
if (sessionStorage.getItem('vehicleMake')) {
  makeInput.value = sessionStorage.getItem('vehicleMake');
  sessionStorage.removeItem('vehicleMake');
}
if (sessionStorage.getItem('vehicleModel')) {
  modelInput.value = sessionStorage.getItem('vehicleModel');
  sessionStorage.removeItem('vehicleModel');
}
if (sessionStorage.getItem('vehicleColour')) {
  colourInput.value = sessionStorage.getItem('vehicleColour');
  sessionStorage.removeItem('vehicleColour');
}
if (sessionStorage.getItem('vehicleOwner')) {
  ownerInput.value = sessionStorage.getItem('vehicleOwner');
  sessionStorage.removeItem('vehicleOwner');

  // Run owner check after restoring value
  checkOwner();
}

// NEW: Enable submit button if all fields are restored
if (
  regoInput.value.trim() !== "" &&
  makeInput.value.trim() !== "" &&
  modelInput.value.trim() !== "" &&
  colourInput.value.trim() !== "" &&
  ownerInput.value.trim() !== ""
) {
  enableButton(submitBtn);
}


  // Initial button states
  disableButton(newOwnerBtn);

  // Event listeners
  ownerInput.addEventListener("input", updateCheckButtonState);
  checkBtn.addEventListener("click", checkOwner);
  submitBtn.addEventListener("click", handleSubmit);

  newOwnerBtn.addEventListener("click", () => {
    // Save vehicle form data in sessionStorage before navigating
    sessionStorage.setItem('vehicleRego', regoInput.value);
    sessionStorage.setItem('vehicleMake', makeInput.value);
    sessionStorage.setItem('vehicleModel', modelInput.value);
    sessionStorage.setItem('vehicleColour', colourInput.value);
    sessionStorage.setItem('vehicleOwner', ownerInput.value);

    // Navigate to add-owner.html
    window.location.href = "add-owner.html";
  });

  // Utility functions
  function disableButton(button) {
    button.disabled = true;
    button.style.opacity = "0";
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
      disableButton(newOwnerBtn);
      disableButton(checkBtn);
      disableButton(submitBtn);
    } else {
      enableButton(checkBtn);
    }
  }

  function showMessage(target, text, isError = false) {
    target.innerHTML = text;
    target.className = `message ${isError ? "error" : "success"}`;
  }

  function clearMessage(target) {
    target.innerHTML = "";
    target.className = "message";
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
  if (ownerInput.value.trim() === "") {
    messageDiv.innerHTML = "";
    showMessage(resultsDiv, "Please enter a name to check!", true);
    return;
  }

  const driverName = ownerInput.value.trim();
  clearMessage(messageDiv);

  try {
    const { data, error } = await supabase
      .from('People')
      .select('*')
      .ilike('Name', `%${driverName}%`);

    if (error) throw error;

    if (data && data.length > 0) {
      displayOwners(data);

      // If there's exactly one owner and its name matches the input exactly,
      // auto-select the owner card so no manual selection is needed.
      if (data.length === 1 && data[0].Name.toLowerCase() === driverName.toLowerCase()) {
        const onlyCard = resultsDiv.querySelector('.card');
        if (onlyCard) {
          selectOwner(onlyCard);
        }
      } else {
        disableButton(newOwnerBtn);
      }
    } else {
      showMessage(resultsDiv, `Owner not found. Please add them`, true);
      enableButton(newOwnerBtn);
    }
  } catch (error) {
    console.error('Error checking owner:', error);
    showMessage(messageDiv, `Error: ${error.message || 'Failed to check owner'}`, true);
  }
}


  function displayOwners(owners) {
    resultsDiv.innerHTML = "";

    let heading = `<h3>Found ${owners.length} matching owner(s):</h3>`;
    if (owners.length > 1) {
      heading += `<p class="info-text">Multiple owners found. Please select the correct owner.</p>`;
    }
    showMessage(messageDiv, heading, false);

    const ownerCards = owners.map(owner => `
      <div class="card" data-owner-id="${owner.PersonID}">
        <h4>${owner.Name || 'Unknown'}</h4>
        ${owner.LicenseNumber ? `<p><strong>License:</strong> ${owner.LicenseNumber}</p>` : ''}
        ${owner.Address ? `<p><strong>Address:</strong> ${owner.Address}</p>` : ''}
        ${owner.DOB ? `<p><strong>DOB:</strong> ${owner.DOB}</p>` : ''}
        <button type="button" class="select-owner-btn">Select owner</button>
      </div>
    `).join('');

    resultsDiv.innerHTML = `<div class="results-grid">${ownerCards}</div>`;

    document.querySelectorAll('.select-owner-btn').forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.card');
        selectOwner(card);
      });
    });
  }

  function selectOwner(card) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    selectedCard = card; 

    const ownerName = card.querySelector('h4').textContent;
    ownerInput.value = ownerName;
    enableButton(submitBtn);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!areAllFieldsFilled()) {
      showMessage(messageDiv, "Please fill in all fields", true);
      return;
    }



    const ownerId = selectedCard.dataset.ownerId;
    const rego = regoInput.value.trim();
    const make = makeInput.value.trim();
    const model = modelInput.value.trim();
    const colour = colourInput.value.trim();

    try {
      const { data: existingVehicle } = await supabase
        .from('Vehicles')
        .select('*')
        .eq('VehicleID', rego)
        .maybeSingle();

      if (existingVehicle) {
        showMessage(messageDiv, `Vehicle with registration ${rego} already exists`, true);
        return;
      }

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

      showMessage(messageDiv, "Vehicle added successfully", false);

      // Clear form
      regoInput.value = '';
      makeInput.value = '';
      modelInput.value = '';
      colourInput.value = '';
      ownerInput.value = '';
      resultsDiv.innerHTML = '';
      selectedCard = null;

      updateCheckButtonState();

      sessionStorage.clear();
    } catch (error) {
      console.error('Error:', error);
      showMessage(messageDiv, `Error: ${error.message || 'Failed to add vehicle'}`, true);
    }
  }
});
