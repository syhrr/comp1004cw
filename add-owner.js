
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  'https://oxinpfpbpvsglksvpnug.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aW5wZnBicHZzZ2xrc3ZwbnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTI1MTgsImV4cCI6MjA1OTA4ODUxOH0.MpFlhTkVXe8nqunU_87cZbf8MQdg8ogJqBbRbU0nIxI'
)

document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");
  const addressInput = document.getElementById("address");
  const dobInput = document.getElementById("dob");
  const licenseInput = document.getElementById("license");
  const expireInput = document.getElementById("expire");
  const resultsDiv = document.getElementById("owner-message");
  const submitBtn = document.getElementById("submit");
  

  const savedName = localStorage.getItem('newOwnerName');
 
  
  if (savedName) {
    nameInput.value = savedName;
    localStorage.removeItem('newOwnerName');
  }
  

  function areAllInputsFilled() {
    return (
      nameInput.value.trim() !== "" &&
      addressInput.value.trim() !== "" &&
      dobInput.value.trim() !== "" &&
      licenseInput.value.trim() !== "" &&
      expireInput.value.trim() !== ""
    );
  }

  submitBtn.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevents form from refreshing the page

    if (!areAllInputsFilled()) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    console.log("All fields are filled. Proceeding to submit...");
    await addOwner();
  });

  async function addOwner() {
    const name = nameInput.value.trim();
    const address = addressInput.value.trim();
    const dob = dobInput.value.trim();
    const license = licenseInput.value.trim();
    const expire = expireInput.value.trim();
  
    // Check for missing fields
    if (!name || !address || !dob || !license || !expire) {
      resultsDiv.innerHTML = 'Error: All fields are required!';
      return;
    }
  
    // Check for existing owner with the same license number
    let { data: existingOwners, error: checkError } = await supabase
      .from('People')
      .select('PersonID')
      .eq('LicenseNumber', license);


    if (checkError) {
      console.error('Error checking license number:', checkError);
      return;
    }

    if (existingOwners.length > 0) {
      resultsDiv.innerHTML = '<h3>Someone with that license number already exists!</h3>'
      return;
    }

  
    // Get next PersonID
    let { data, error: idError } = await supabase
      .from('People')
      .select('PersonID')
      .order('PersonID', { ascending: false })
      .limit(1);
  
    let nextID;
  
    if (idError) {
      console.error('Error fetching highest PersonID:', idError);
      resultsDiv.innerHTML = 'Error: Could not generate new ID.';
      return;
    } else if (data && data.length > 0) {
      const highestPersonID = data[0].PersonID;
      nextID = highestPersonID + 1;
    } else {
      nextID = 1;
    }
  
    // Insert new owner
    const { error: insertError } = await supabase
      .from('People')
      .insert([
        {
          PersonID: nextID,
          Name: name,
          Address: address,
          DOB: dob,
          LicenseNumber: license,
          ExpiryDate: expire
        }
      ]);
  
    if (insertError) {
      console.error('Error adding owner:', insertError);
      resultsDiv.innerHTML = 'Error: Failed to add owner.';
    } else {
      resultsDiv.innerHTML = 'Owner added successfully!';
      // Clear the form fields
      nameInput.value = "";
      addressInput.value = "";
      dobInput.value = "";
      licenseInput.value = "";
      expireInput.value = ""; 

      //send back to add vehicle page
      alert("The owner " + name + " has been added to the database.");
      window.location.href = "add-vehicle.html";
    }
  }
  
});
