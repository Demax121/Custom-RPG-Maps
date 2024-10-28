// Select the modal alert element
const modalAlert = document.querySelector(".modal-alert");
// Add an event listener to the modal close button to close the modal when clicked
modalAlert.querySelector(".modal-close").addEventListener("click", () => {
  modalAlert.close();
});

// Array used to store layer group objects (overlays)
const overlaysArray = [];

// Object template for a new marker
let newMarker = {
  markerID: "",
  markerName: "",
  coordinates: [],
  overlayName: "",
};

// Object template for a new layer group (overlay)
let newLayerGroup = {
  name: "",
  group: "",
};

// Function to create a new overlay if it doesn't already exist
function addNewOverlay(overlayName) {
    // Check if the overlay already exists in the overlaysArray
  if (!overlaysArray.some((overlay) => overlay.name === overlayName)) {
        // Create a new layer group for the overlay
    let newLayerGroup = {
      name: overlayName,
      group: L.layerGroup([]).addTo(Worldmap),
    };
    layerControl.addOverlay(newLayerGroup.group, newLayerGroup.name); // Add the new layer group to the layer control
    overlaysArray.push(newLayerGroup); // Add the new layer group to the overlaysArray
  }
}

// Select the marker list template element
const markerListTemplate = document.querySelector("#sidebar-layer-template");

// Function to add an overlay and marker to the sidebar pane
function addToList(
  listContainer, // The container element where the list will be added
  overlayName, // The name of the overlay
  markerName, // The name of the marker
  markerCoordinates, // The coordinates of the marker
  markerID, // The unique identifier of the marker
  itemTemplate // The template for the list item
) {
    // Find the target layer in the list container
  let targetLayer = listContainer.querySelector(
    `.marker-list[data-layer-group="${overlayName}"]`
  );
  // If the target layer does not exist, create a new one
  if (!targetLayer) {
    let newList = markerListTemplate.content.cloneNode(true); // Clone the marker list template
        
    // Set the data attributes and text content for the new list
    newList.querySelector(".marker-list-toggle").dataset.targetLayer = overlayName;
    newList.querySelector(".marker-list-toggle").textContent = overlayName;
    newList.querySelector(".marker-list").dataset.layerGroup = overlayName;
    listContainer.appendChild(newList); // Append the new list to the list container
    // Re-select the target layer
    targetLayer = listContainer.querySelector(
      `.marker-list[data-layer-group="${overlayName}"]`
    );
  }

  let newlistItem = itemTemplate.content.cloneNode(true); // Clone the item template for the new list item
  // Set the data attributes and text content for the new list item
  newlistItem.querySelector(".marker-list-item").dataset.layer = overlayName;
  newlistItem.querySelector(".marker-link").dataset.markerId = markerID;
  newlistItem.querySelector(".marker-link").textContent = markerName;
  let [lat, lng] = markerCoordinates;
  newlistItem.querySelector(
    ".marker-info"
  ).textContent = `Lat: ${lat}, Lng: ${lng}`;

  targetLayer.appendChild(newlistItem);   // Add the new list item to the target layer in the sidebar
}

// Common class for both sidebar containers
const MarkersContainers = document.querySelectorAll(".marker-list-container");

// Event delegation to open marker lists in the sidebar pane
function openMarkerList(event) {
  let targetToggle = event.target.closest(".marker-list-toggle");   // Find the closest element with the class "marker-list-toggle"
  if (!targetToggle) {
    return; // Exit if no toggle element is found
  }
  let container = targetToggle.closest(".list-container");   // Find the closest container element
  let markerList = container.querySelector(".marker-list");   // Find the marker list within the container
  markerList.classList.toggle("marker-list--open");   // Toggle the "marker-list--open" class to show/hide the marker list
}

// Enable opening marker lists in the sidebar containers
MarkersContainers.forEach((container) => {
  container.addEventListener("click", openMarkerList);   // Add a click event listener to each container
});

// Clicking onto the marker link in the sidebar pane zooms onto it
function goToMarker(event, markersArray) {
  event.preventDefault(); // Prevent the default link behavior
  let markerLink = event.target.closest(".marker-link");   // Find the closest element with the class "marker-link"
  if (!markerLink) {
    return; // Exit if no marker link element is found
  }
  let markerID = markerLink.dataset.markerId;   // Get the marker ID from the data attribute
  let marker = markersArray.find((marker) => String(marker.markerID) === markerID);   // Find the marker object in the markersArray using the marker ID
  marker.mapMarker.openPopup();   // Open the popup for the marker on the map
  Worldmap.flyTo(marker.mapMarker.getLatLng(), 5);   // Fly to the marker's location on the map with a zoom level of 5
}





document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Loaded Successfully");
});


