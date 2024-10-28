
const baseMarkers = []; // Initialize an empty array to store markers fetched from the server
const baseMarkersContainer = document.querySelector(".base-markers-container");// Select the container element where the markers will be displayed
baseMarkersContainer.addEventListener("click", (event) => goToMarker(event, baseMarkers));// Add an event listener to the container to handle marker clicks
const jsonUrl = "markers.json"; // URL to the JSON file containing marker data

// Fetch the marker data from the JSON file
fetch(jsonUrl)
    // Check if the response is ok, otherwise throw an error
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    
    return response.json(); // Parse the response as JSON
  })
  .then((data) => {
    // Function to create a marker object from fetched data
    function createMarkerObject(markerID, markerName, coordinates, overlayName, description, markerIcon) {
      return {
        markerID,
        markerName,
        coordinates,
        overlayName,
        description,
        markerIcon,
      };
    }

    // Iterate over the fetched data and create marker objects
    data.forEach((markerData) => {
      let baseMarker = createMarkerObject(
        markerData.markerID,
        markerData.markerName,
        markerData.coordinates,
        markerData.overlayName,
        markerData.description,
        markerData.markerIcon
      );
      baseMarkers.push(baseMarker);// Add the created marker object to the baseMarkers array
      addNewOverlay(markerData.overlayName); // Create a new overlay from fetched data
    });

    // After fetching markers, add them to the map
    addbaseMarkers();
  })
  .catch((error) => {
    console.error(`Fetch error: ${error.message}`);
  });


let locationName = document.querySelector(".location-name");
let descContainer =  document.querySelector(".location-description-container");
let sidebarState = document.querySelector("#sidebar");

// Adding markers to the map and sidebar pane
function addbaseMarkers() {
  baseMarkers.forEach((marker) => {
    let leafletMarker = L.marker(marker.coordinates, {icon: createCustomIcon(marker.markerIcon)}); // Put the marker in corresponding coordinates and add a custom icon to the map
    let customPopupContent = `<div class="custom-popup">${marker.markerName}</div>`; // Add the custom popup with marker/location name
    leafletMarker.bindPopup(customPopupContent).openPopup(); // Bind the popup to the marker
    leafletMarker
    let targetLayer = overlaysArray.find((layer) => layer.name === marker.overlayName); // Find the overlay in the overlay array corresponding to the marker overlay
    if (targetLayer) {
      targetLayer.group.addLayer(leafletMarker); // Add the marker to the corresponding overlay
      marker.mapMarker = leafletMarker; // Bind object from the array to the marker on the map
      //console.log(`Marker added for ${marker.markerName}`); <-- For debugging purposes
    }
    // else {
    //   console.error(`Overlay not found for marker: ${marker.markerName}`); <-- For debugging purposes
    // }
    const listItemTemplate = document.querySelector("#sidebar-marker-template--base"); // List item template for the new marker
    // Add the marker to the sidebar pane
    addToList(
      baseMarkersContainer,
      marker.overlayName,
      marker.markerName,
      marker.coordinates,
      marker.markerID,
      listItemTemplate
    );
    // Add a click event listener to the leaflet marker
    leafletMarker.addEventListener('click', () => {
      let desc = baseMarkers.find((element) => element.markerName === marker.markerName);  // Find the marker description from the baseMarkers array
    
      // Check if the sidebar has the "collapsed" class
      if (sidebarState.classList.contains("collapsed")) {
        locationName.textContent = marker.markerName;
        descContainer.innerHTML = desc.description;
        sidebar.open('LocationDescription');
      
        // If the sidebar is not collapsed and a different marker is clicked, change the description in the sidebar
      } else if (!sidebarState.classList.contains("collapsed") && locationName.textContent != marker.markerName) {
        locationName.textContent = marker.markerName;
        descContainer.innerHTML = desc.description;
        sidebar.open('LocationDescription');
      
        // If the sidebar is not collapsed and the same marker is clicked, close sidebar
      } else if (!sidebarState.classList.contains("collapsed") && locationName.textContent === marker.markerName) {
        sidebar.close();
      }
    });
    
  });
}
