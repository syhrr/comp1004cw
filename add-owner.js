import supabase from './supabase.js';

document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");
  const addressInput = document.getElementById("address");
  const dobInput = document.getElementById("dob");
  const licenseInput = document.getElementById("license");
  const expireInput = document.getElementById("expire");
  const messageDiv = document.getElementById("owner-message");
  const submitBtn = document.getElementById("submit");

  const savedName = localStorage.getItem('newOwnerName');
  if (savedName) {
    nameInput.value = savedName;
    localStorage.removeItem('newOwnerName');
  }

  submitBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    clearMessage(messageDiv);

    if (!areAllInputsFilled()) {
      showMessage(messageDiv, "Please ensure all fields are filled!", true);
      return;
    }

    console.log("All fields are filled. Proceeding to submit...");
    await addOwner();
  });

  function areAllInputsFilled() {
    return (
      nameInput.value.trim() &&
      addressInput.value.trim() &&
      dobInput.value.trim() &&
      licenseInput.value.trim() &&
      expireInput.value.trim()
    );
  }

  async function addOwner() {
    const name = nameInput.value.trim();
    const address = addressInput.value.trim();
    const dob = dobInput.value.trim();
    const license = licenseInput.value.trim();
    const expire = expireInput.value.trim();

    // Check for duplicate license number
    const { data: existingOwners, error: checkError } = await supabase
      .from('People')
      .select('PersonID')
      .eq('LicenseNumber', license);

    if (checkError) {
      console.error('Error checking license number:', checkError);
      showMessage(messageDiv, "Error checking license number.", true);
      return;
    }

    if (existingOwners.length > 0) {
      showMessage(messageDiv, "Someone with that license number already exists!", true);
      return;
    }

    // Get next available PersonID
    const { data, error: idError } = await supabase
      .from('People')
      .select('PersonID')
      .order('PersonID', { ascending: false })
      .limit(1);

    if (idError) {
      console.error('Error fetching highest PersonID:', idError);
      showMessage(messageDiv, "Could not generate new ID.", true);
      return;
    }

    const nextID = data?.length > 0 ? data[0].PersonID + 1 : 1;

    // Insert new person
    const { error: insertError } = await supabase
      .from('People')
      .insert([
        {
          PersonID: nextID,
          Name: name,
          Address: address,
          DOB: dob,
          LicenseNumber: license,
          ExpiryDate: expire,
        }
      ]);

    if (insertError) {
      console.error('Error adding owner:', insertError);
      showMessage(messageDiv, "Failed to add new owner.", true);
    } else {
      showMessage(messageDiv, "New owner added successfully!");

      // Reset form
      nameInput.value = "";
      addressInput.value = "";
      dobInput.value = "";
      licenseInput.value = "";
      expireInput.value = "";

      // Redirect back to Add Vehicle page after delay
      setTimeout(() => {
        window.location.href = "add-vehicle.html";
      }, 2000);
    }
  }

  function showMessage(target, text, isError = false) {
    target.textContent = text;
    target.className = `message ${isError ? "error" : "success"}`;
  }

  function clearMessage(target) {
    target.textContent = "";
    target.className = "message";
  }
});
