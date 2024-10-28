//Button to show menu for checkpoint marker
const checkpointMenuToggle = document.querySelector(".checkpoint-menu-toggle");
checkpointMenuToggle.addEventListener("click", () => {
  let checkpointMenu = document.querySelector(".checkpoint-menu");
  checkpointMenu.classList.toggle("menu--active");
});

//Remove checkpoint marker from map
const closeCheckpoint = document.querySelector(".close__checkpoint");
closeCheckpoint.addEventListener("click", () => {
  closeCords(Cords);
});

//Add checkpoint marker to map
const openCheckpoint = document.querySelector(".open__checkpoint");
openCheckpoint.addEventListener("click", () => {
  Cords.addTo(Worldmap);
});

//Button to show export menu for user created markers
const exportMenuToggle = document.querySelector(".export-menu-toggle");
exportMenuToggle.addEventListener("click", () => {
  const exportMenu = document.querySelector(".export-menu");
  exportMenu.classList.toggle("menu--active");
});

const customMarkers = []; //user created marker array
const uniqueNames = new Set(); //set for all marker names
const uniqueCoordinates = new Set(); //set for all marker coordinates

//get current position coordinates of the checkpoint marker
function getCords(get) {
  let latLng = get.getLatLng();
  let formattedLat = latLng.lat.toFixed(2);
  let formattedLng = latLng.lng.toFixed(2);
  return [formattedLat, formattedLng];
}
//remove checkpoint marker from map
function closeCords(e) {
  e.remove();
  e.setLatLng([0, 0]);
}
//create checkpoint marker
let Cords = L.marker([0, 0], {
  icon: redIcon, //icon for the checkpoint marker
  draggable: true,
  zIndexOffset: 9998,
});



/*
function to check if the marker name in set is corresponding to a marker from customMarkers array
If there is no corresponding marker in an array delete the name from uniqueNames set
*/
function rescan() {
  uniqueNames.forEach(name => {
    if (!customMarkers.some(marker => marker.markerName === name)) {
      uniqueNames.delete(name);
    }
  });
}



const checkpointPopupTemplate = document.querySelector("#checkpoint-popup-template"); //popup template

Cords.bindPopup("");//bind popup to checkpoint marker
Cords.openPopup("");//open checkpoint marker popup

//when user stops draging the checkpoint marker
Cords.on("dragend", () => {
  let coordinates = getCords(Cords); //get coordinates
  let checkpoint = checkpointPopupTemplate.content.cloneNode(true); //use the checkpoint template
  checkpoint.querySelector(".checkpoint-coordinates").textContent = coordinates;//show the coordinates
  checkpoint.querySelector(".addMarker").addEventListener("click", () => {
    addMarker(); //add marker to list and map
  });
  checkpoint.querySelector(".closeCords").addEventListener("click", () => {
    closeCords(Cords); //remove the checkpoint marker from map
  });
  Cords.getPopup().setContent(checkpoint).openOn(Worldmap); //open checkpoint popup
});

let markerID = 0; //ID for markers, always Uniqe

//function to keep ID unique
function newID() {
  markerID++;
}

const customMarkersContainer = document.querySelector(".custom-markers-container"); //sidebar container for user created markers
customMarkersContainer.addEventListener("click", (event) => goToMarker(event, customMarkers)); //when marker from the sidebar is clicked got to it`s location

//This function lets you rename markers
customMarkersContainer.addEventListener("click", function Rename(event) {
  event.preventDefault();

  let rename = event.target.closest(".marker-rename"); //take the clicked marker
  let modal = document.querySelector(".modal-rename");//open modal for reanming markers
  let required = modal.querySelector(".name-required-modal"); //warning modal
  let closeModal = modal.querySelector(".modal-close"); //close modal button

  closeModal.addEventListener("click", () => {
    modal.close(); //close modal
    required.classList.remove("name-required-modal--active"); // Remove the active class from the required name modal
    document.querySelector(".name-exists-modal").classList.remove("name-exists-modal--active"); // Remove the active class from the name exists modal
    modal.querySelector(".modal-input").value = ""; // Clear the input field in the modal
  });

  // If there is no rename action, exit the function
  if (!rename) {
   return;
  }

  let listItem = rename.closest(".marker-list-item"); // Find the closest marker list item to the rename button
  let markerLink = listItem.querySelector(".marker-link"); // Find the marker link within the list item
  let markerID = markerLink.dataset.markerId; // Get the marker ID from the data attribute of the marker link
  let markerToRename = customMarkers.find((marker) => String(marker.markerID) === markerID); // Find the marker object in the customMarkers array using the marker ID
  let modalInput = modal.querySelector(".modal-input"); // Get the input field from the modal
  let oldName = markerToRename.markerName; // Store the old name of the marker

  modal.showModal(); // Open the modal dialog

  let acceptName = modal.querySelector(".modal-accept"); // Get the accept button from the modal

  // Function to handle the name change
  function handleNameChange() {
    let newName = modalInput.value.trim();   // Get the new name from the input field and trim any whitespace
      
    // If the new name is empty, show the required name modal and exit the function
    if (newName === "") {
      required.classList.add("name-required-modal--active");
      return;
    }
    newName = capitalize(newName);  // Capitalize the new name

    // If the new name already exists, show the name exists modal and exit the function
    if (uniqueNames.has(newName)) {
      document.querySelector(".name-exists-modal").classList.add("name-exists-modal--active");
      return;
    }
    uniqueNames.delete(oldName);   // Remove the old name from the set of unique names
    uniqueNames.add(newName);   // Add the new name to the set of unique names
    markerToRename.markerName = newName;   // Update the marker's name with the new name
    markerLink.textContent = newName;   // Update the text content of the marker link with the new name
    let customPopupContent = `<div class="custom-popup">${newName}</div>`;   // Create custom popup content with the new name
    markerToRename.mapMarker.bindPopup(customPopupContent).openPopup();   // Bind the new popup content to the marker and open the popup
    modal.close();   // Close the modal dialog
    modalInput.value = "";   // Clear the input field in the modal
    document.querySelector(".name-exists-modal").classList.remove("name-exists-modal--active");

    acceptName.removeEventListener("click", handleNameChange);  //remove old event listener and reset the function
  }

  acceptName.addEventListener("click", handleNameChange); // Add an event listener to the accept button to handle the name change
  rescan(); //activate the rescan function
});

// Add an event listener to the custom markers container to handle marker deletion
customMarkersContainer.addEventListener("click", function removeMarker(event) {
  event.preventDefault();
  let markerDelete = event.target.closest(".marker-delete");   // Find the closest delete button to the clicked element
  let modal = document.querySelector(".modal-delete");   // Select the delete confirmation modal and its action buttons
  let modalTakeAction = modal.querySelector(".modal-take-action");
  let modalDropAction = modal.querySelector(".modal-drop-action");

    // If no delete button is found, exit the function
  if (!markerDelete) {
    return;
  }

  let listItem = markerDelete.closest(".marker-list-item");   // Find the closest marker list item to the delete button
  let listContainer = listItem.closest(".list-container");   // Find the closest list container to the list item
  let markerLink = listItem.querySelector(".marker-link");   // Find the marker link within the list item
  let markerID = markerLink.dataset.markerId;   // Get the marker ID from the data attribute of the marker link
  let list = listContainer.querySelector(".marker-list");   // Find the marker list within the list container
  let markerToDelete = customMarkers.find((marker) => String(marker.markerID) === markerID);   // Find the marker object in the customMarkers array using the marker ID
  let name = markerToDelete.markerName;   // Get the name of the marker to delete
  let overlay = overlaysArray.find((layerGroup) => String(layerGroup.name) === listItem.dataset.layer);   // Find the overlay object in the overlaysArray using the layer name
  let layerGroup = overlay.group;   // Get the layer group from the overlay object
  modal.showModal();   // Show the delete confirmation modal

    // Function to check if the layer group is empty and remove it if necessary
  function checkGroup() {
    if (layerGroup.getLayers().length === 0) {
      let indexOverlay = overlaysArray.indexOf(overlay);
      if (indexOverlay !== -1) {
        overlaysArray.splice(indexOverlay, 1);
        layerControl.removeLayer(layerGroup);
      }
    }
  }

    // Function to remove the marker item
  function removeItem() {
    if (list.contains(listItem)) {
      layerGroup.removeLayer(markerToDelete.mapMarker);
      list.removeChild(listItem);

      // Remove the marker from the customMarkers array and the unique names set
      let indexMarker = customMarkers.indexOf(markerToDelete); 
      uniqueNames.delete(name);
      customMarkers.splice(indexMarker, 1);
    }

        // If the list is empty, remove the list container
    if (list.children.length === 0) {
      if (customMarkersContainer.contains(listContainer)) {
        customMarkersContainer.removeChild(listContainer);
      }
    }
    modal.close(); // Close the modal and check the layer group
    checkGroup(); //active checkGroup function after deletion
  }

    // Add event listeners to the modal action buttons
  modalTakeAction.addEventListener("click", removeItem);
  modalDropAction.addEventListener("click", () => {
    modal.close();
    return;
  });


});

// Capitalize first letter of the name of layer and marker
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Function to add a new marker to the map and sidebar
function addMarker() {
  let markerName = document.querySelector(".markerName").value.trim();
  markerName = capitalize(markerName);
  let overlayName = document.querySelector(".overlayName").value.trim();
  overlayName = capitalize(overlayName);

    // Check if the marker name is empty
  if (markerName === "") {
    let fieldRequired = document.querySelector(".name-required");
    let inputName = document.querySelector(".markerName");
    fieldRequired.classList.toggle("name-required--active");
    inputName.classList.toggle("input-required");
    return;
  }

    // Check if the overlay name is empty
  if (overlayName === "") {
    let fieldRequired = document.querySelector(".layer-required");
    fieldRequired.classList.toggle("layer-required--active");
    let inputOverlay = document.querySelector(".overlayName");
    inputOverlay.classList.toggle("input-required");
    return;
  }
  let markerCoordinates = getCords(Cords);   // Get the coordinates for the new marker
  


  const iconMenu = document.querySelector('#icons-menu');   // Select the icon menu and create a custom icon
  const customIcon = createCustomIcon(iconMenu.value);
  

  // Check if the marker name or coordinates already exist
  if (uniqueNames.has(markerName) || uniqueCoordinates.has(markerCoordinates)) {
    modalAlert.querySelector(".modal-alert-title").textContent = "Marker name already exists";
    modalAlert.showModal();
    return;
  }

  newID();   // Generate a new unique ID for the marker

  // Add the marker name and coordinates to the sets of unique names and coordinates
  uniqueNames.add(markerName);
  uniqueCoordinates.add(markerCoordinates);
  addNewOverlay(overlayName);   // Add a new overlay if it doesn't already exist

  // Create a new marker object
  newMarker = {
    markerID: markerID,
    markerName: markerName,
    coordinates: markerCoordinates,
    overlayName: overlayName,
    markerIcon: iconMenu,
  };
  customMarkers.push(newMarker);   // Add the new marker to the customMarkers array

    // Create a new Leaflet marker on map and bind a popup to it
  let customMarker = L.marker(markerCoordinates, { icon: customIcon });
  let customPopupContent = `<div class="custom-popup">${markerName}</div>`;
  customMarker.bindPopup(customPopupContent).openPopup();
  newMarker.mapMarker = customMarker;

  // Find the target layer and add the new marker to it
  let targetLayer = overlaysArray.find((layer) => layer.name === overlayName); 
  targetLayer.group.addLayer(customMarker);

  // Select the custom item template and add the new marker to the sidebar list
  const customItem = document.querySelector("#sidebar-marker-template--custom");   
  addToList(customMarkersContainer, overlayName, markerName, markerCoordinates, markerID, customItem);
}



// Export markers created by the user as a JSON file
const exportJSONfile = document.querySelector(".export-json").addEventListener("click", function () {
  if (customMarkers.length > 0) {

    // Map the customMarkers array to a new array of marker data
    let markerData = customMarkers.map((marker) => {
      let { markerName, coordinates, overlayName, markerIcon } = marker;
      return {
        markerName: markerName,
        coordinates: coordinates,
        overlayName: overlayName,
        markerIcon: markerIcon
      };
    });

     // Create a JSON blob from the marker data
    const jsonBlob = new Blob([JSON.stringify(markerData, null, 2)], {
      type: "application/json",
    });

    // Create a download link for the JSON file and trigger the download
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "markers.json";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {

    // Show an alert if there are no markers to export
    modalAlert.querySelector(".modal-alert-title").textContent =
      "There are no markers to export";
    modalAlert.showModal();
  }
});


// Export markers created by the user as a text file ready to be imported into a database
const exportTextFile = document.querySelector(".export-txt").addEventListener("click", function () {
  if (customMarkers.length > 0) {

    // Map the customMarkers array to a new array of marker data strings
    let markerData = customMarkers.map((marker) => {
      let { markerName, coordinates, overlayName, markerIcon } = marker;
      return `('${markerName}', '${coordinates[0]}', '${coordinates[1]}', '${overlayName}', '${markerIcon}'),`;
    });
    const resultString = markerData.join("\n");     // Join the marker data strings into a single string
    const txtBlob = new Blob([resultString], { type: "text/plain" });     // Create a text blob from the marker data string

    // Create a download link for the text file and trigger the download
    const url = URL.createObjectURL(txtBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "markers.txt";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {

    // Show an alert if there are no markers to export
    modalAlert.querySelector(".modal-alert-title").textContent =
      "There are no markers to export";
    modalAlert.showModal();
  }
});
