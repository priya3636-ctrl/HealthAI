// ==========================================
// HealthAI - Nearby Hospitals
// ==========================================

const findBtn = document.getElementById("findBtn");
const nuzvidBtn = document.getElementById("nuzvidBtn");
const searchBtn = document.getElementById("searchBtn");

const locationInput = document.getElementById("locationInput");

const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const locationTitle = document.getElementById("locationTitle");
const locationText = document.getElementById("locationText");

const hospitalList = document.getElementById("hospitalList");

const resultsHeader = document.getElementById("resultsHeader");
const resultsLocation = document.getElementById("resultsLocation");
const hospitalCount = document.getElementById("hospitalCount");

const emptyState = document.getElementById("emptyState");


// ==========================================
// Configuration
// ==========================================

// Smaller radius makes Overpass requests faster.
const SEARCH_RADIUS = 5000;

// Maximum number of hospitals displayed.
const MAX_HOSPITALS = 20;

// Multiple Overpass servers.
const OVERPASS_SERVERS = [

    "https://overpass-api.de/api/interpreter",

    "https://overpass.kumi.systems/api/interpreter",

    "https://overpass.private.coffee/api/interpreter"

];

// Fallback location database.
const NOMINATIM_URL =
    "https://nominatim.openstreetmap.org/search";


// ==========================================
// Button Events
// ==========================================

if (findBtn) {
    findBtn.addEventListener(
        "click",
        getCurrentLocation
    );
}

if (searchBtn) {
    searchBtn.addEventListener(
        "click",
        searchManualLocation
    );
}

if (nuzvidBtn) {

    nuzvidBtn.addEventListener(
        "click",
        () => {

            locationInput.value =
                "Nuzvid, Andhra Pradesh";

            searchManualLocation();

        }
    );

}


// ==========================================
// Enter key in search box
// ==========================================

if (locationInput) {

    locationInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                searchManualLocation();

            }

        }
    );

}


// ==========================================
// Get Current Browser Location
// ==========================================

function getCurrentLocation() {

    clearMessages();

    console.log(
        "Getting browser location..."
    );

    if (!navigator.geolocation) {

        showError(
            "Your browser does not support location services. " +
            "Please search your city manually."
        );

        return;

    }

    showLoading();

    locationTitle.textContent =
        "Detecting your location...";

    locationText.textContent =
        "Please allow location access if Chrome asks.";


    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            console.log(
                "Location detected:",
                latitude,
                longitude,
                "Accuracy:",
                accuracy
            );


            // ==================================
            // Reject inaccurate browser location
            // ==================================

            if (
                !Number.isFinite(accuracy) ||
                accuracy > 10000
            ) {

                hideLoading();

                locationTitle.textContent =
                    "Location accuracy is low";

                locationText.innerHTML =
                    "Chrome detected approximately " +
                    "<strong>" +
                    (
                        Number.isFinite(accuracy)
                            ? Math.round(accuracy / 1000)
                            : "unknown"
                    ) +
                    " km</strong> accuracy. " +
                    "Please search your city manually.";

                showError(
                    "Your browser is providing an approximate location. " +
                    "For accurate nearby hospitals, please use the manual " +
                    "location search below."
                );

                return;

            }


            locationTitle.textContent =
                "Your location detected";

            locationText.textContent =
                `Accuracy: ${Math.round(accuracy)} meters`;


            await loadHospitals(
                latitude,
                longitude,
                "Your current location"
            );

        },


        (error) => {

            hideLoading();

            console.error(
                "Location error:",
                error
            );


            let message =
                "Unable to detect your current location.";


            if (error.code === 1) {

                message =
                    "Location permission was denied. " +
                    "Allow location access in Chrome and try again.";

            }

            else if (error.code === 2) {

                message =
                    "Your device could not determine your location. " +
                    "Please search your city manually.";

            }

            else if (error.code === 3) {

                message =
                    "Location detection timed out. " +
                    "Please search your city manually.";

            }


            showError(message);


            locationTitle.textContent =
                "Location unavailable";

            locationText.textContent =
                "Use the manual location search below.";

        },


        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}


// ==========================================
// Manual Location Search
// ==========================================

async function searchManualLocation() {

    const place =
        locationInput
            ? locationInput.value.trim()
            : "";


    if (!place) {

        showError(
            "Please enter a city or area. " +
            "Example: Nuzvid, Andhra Pradesh"
        );

        return;

    }


    clearMessages();

    showLoading();


    locationTitle.textContent =
        "Searching location...";

    locationText.textContent =
        place;


    try {

        const url =
            NOMINATIM_URL +
            "?format=json" +
            "&limit=1" +
            "&countrycodes=in" +
            "&q=" +
            encodeURIComponent(place);


        console.log(
            "Geocoding:",
            place
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Location search failed with HTTP ${response.status}.`
            );

        }


        const locations =
            await response.json();


        if (
            !Array.isArray(locations) ||
            locations.length === 0
        ) {

            throw new Error(
                "Location not found."
            );

        }


        const latitude =
            parseFloat(
                locations[0].lat
            );

        const longitude =
            parseFloat(
                locations[0].lon
            );

        const displayName =
            locations[0].display_name;


        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            throw new Error(
                "Invalid coordinates received."
            );

        }


        console.log(
            "Manual location:",
            latitude,
            longitude,
            displayName
        );


        locationTitle.textContent =
            "Location selected";

        locationText.textContent =
            displayName;


        await loadHospitals(
            latitude,
            longitude,
            place
        );

    }


    catch (error) {

        console.error(
            "Location search error:",
            error
        );


        hideLoading();


        showError(
            "Could not find that location. " +
            "Try entering something like " +
            "\"Nuzvid, Andhra Pradesh\"."
        );

    }

}


// ==========================================
// Load Hospitals
// ==========================================

async function loadHospitals(
    latitude,
    longitude,
    locationName
) {

    showLoading();


    hospitalList.innerHTML = "";

    resultsHeader.style.display =
        "none";

    emptyState.style.display =
        "none";


    console.log(
        "Searching hospitals:",
        latitude,
        longitude
    );


    // ======================================
    // Smaller and faster Overpass query
    // ======================================

    const query = `

[out:json][timeout:15];

(
    node["amenity"="hospital"](around:${SEARCH_RADIUS},${latitude},${longitude});

    way["amenity"="hospital"](around:${SEARCH_RADIUS},${latitude},${longitude});
);

out center tags;

`;


    let data = null;

    let lastError = null;


    // ======================================
    // Try Overpass servers
    // ======================================

    for (
        const server of OVERPASS_SERVERS
    ) {

        try {

            console.log(
                "Trying Overpass:",
                server
            );


            const controller =
                new AbortController();


            const timeout =
                setTimeout(
                    () => controller.abort(),
                    12000
                );


            const response =
                await fetch(
                    server,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "text/plain;charset=UTF-8"
                        },

                        body: query,

                        signal:
                            controller.signal
                    }
                );


            clearTimeout(timeout);


            console.log(
                "Overpass response:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    `Overpass server returned ${response.status}`
                );

            }


            data =
                await response.json();


            if (
                data &&
                Array.isArray(data.elements)
            ) {

                console.log(
                    "Overpass request successful."
                );

                break;

            }

        }


        catch (error) {

            console.warn(
                "Overpass server failed:",
                server,
                error
            );


            lastError =
                error;

        }

    }


    // ======================================
    // If Overpass fails, use Nominatim
    // ======================================

    if (!data) {

        console.warn(
            "All Overpass servers failed."
        );

        console.log(
            "Trying Nominatim hospital fallback..."
        );


        try {

            data =
                await searchHospitalsWithNominatim(
                    latitude,
                    longitude,
                    locationName
                );


            if (data) {

                console.log(
                    "Nominatim hospital fallback successful."
                );

            }

        }

        catch (error) {

            console.error(
                "Nominatim hospital fallback failed:",
                error
            );

            lastError =
                error;

        }

    }


    hideLoading();


    // ======================================
    // All APIs failed
    // ======================================

    if (!data) {

        console.error(
            "All hospital APIs failed:",
            lastError
        );


        showError(
            "Nearby hospital services are temporarily unavailable. " +
            "Please try again in a few seconds."
        );


        return;

    }


    console.log(
        "Hospital data:",
        data
    );


    // ======================================
    // No hospitals
    // ======================================

    if (
        !data.elements ||
        data.elements.length === 0
    ) {

        emptyState.style.display =
            "block";


        resultsHeader.style.display =
            "flex";


        resultsLocation.textContent =
            locationName;


        hospitalCount.textContent =
            "0 hospitals";


        return;

    }


    // ======================================
    // Convert hospital data
    // ======================================

    const hospitals =
        data.elements

            .map(
                (item) => {

                    const tags =
                        item.tags || {};


                    const lat =
                        item.lat ??
                        item.center?.lat;


                    const lon =
                        item.lon ??
                        item.center?.lon;


                    if (
                        lat === undefined ||
                        lon === undefined
                    ) {

                        return null;

                    }


                    const name =
                        tags.name ||
                        tags["official_name"] ||
                        tags["alt_name"] ||
                        "Hospital";


                    const address =
                        buildAddress(tags);


                    const distance =
                        calculateDistance(
                            latitude,
                            longitude,
                            Number(lat),
                            Number(lon)
                        );


                    return {

                        name,

                        address,

                        latitude:
                            Number(lat),

                        longitude:
                            Number(lon),

                        distance

                    };

                }
            )

            .filter(Boolean)

            .sort(
                (a, b) =>
                    a.distance -
                    b.distance
            );


    // ======================================
    // Remove duplicates
    // ======================================

    const uniqueHospitals =
        [];


    const seen =
        new Set();


    hospitals.forEach(
        (hospital) => {

            const key =
                hospital.name
                    .toLowerCase()
                    .trim();


            if (
                !seen.has(key)
            ) {

                seen.add(key);

                uniqueHospitals.push(
                    hospital
                );

            }

        }
    );


    // ======================================
    // Display
    // ======================================

    resultsHeader.style.display =
        "flex";


    resultsLocation.textContent =
        locationName;


    hospitalCount.textContent =
        `${uniqueHospitals.length} hospitals`;


    uniqueHospitals
        .slice(
            0,
            MAX_HOSPITALS
        )
        .forEach(
            renderHospital
        );

}


// ==========================================
// Nominatim Hospital Fallback
// ==========================================

async function searchHospitalsWithNominatim(
    latitude,
    longitude,
    locationName
) {

    const query =
        `hospital, ${locationName}`;


    const url =
        NOMINATIM_URL +
        "?format=json" +
        "&limit=20" +
        "&countrycodes=in" +
        "&q=" +
        encodeURIComponent(query);


    console.log(
        "Nominatim fallback query:",
        query
    );


    const response =
        await fetch(
            url,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                },

                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `Nominatim returned HTTP ${response.status}`
        );

    }


    const locations =
        await response.json();


    if (
        !Array.isArray(locations)
    ) {

        return {
            elements: []
        };

    }


    const elements =
        locations
            .map(
                (item) => {

                    const lat =
                        parseFloat(
                            item.lat
                        );

                    const lon =
                        parseFloat(
                            item.lon
                        );


                    if (
                        !Number.isFinite(lat) ||
                        !Number.isFinite(lon)
                    ) {

                        return null;

                    }


                    const displayName =
                        item.display_name ||
                        "Hospital";


                    return {

                        lat,

                        lon,

                        tags: {

                            name:
                                item.name ||
                                extractName(
                                    displayName
                                ),

                            "addr:full":
                                displayName

                        }

                    };

                }
            )
            .filter(Boolean);


    return {
        elements
    };

}


// ==========================================
// Extract Name
// ==========================================

function extractName(
    displayName
) {

    if (!displayName) {

        return "Hospital";

    }


    const firstPart =
        String(displayName)
            .split(",")[0]
            .trim();


    return firstPart ||
        "Hospital";

}


// ==========================================
// Build Address
// ==========================================

function buildAddress(tags) {

    const parts = [

        tags["addr:housenumber"],

        tags["addr:street"],

        tags["addr:suburb"],

        tags["addr:city"],

        tags["addr:district"],

        tags["addr:state"]

    ].filter(Boolean);


    if (
        parts.length > 0
    ) {

        return parts.join(
            ", "
        );

    }


    return (
        tags["addr:full"] ||
        tags["description"] ||
        "Address unavailable"
    );

}


// ==========================================
// Render Hospital Card
// ==========================================

function renderHospital(
    hospital
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "hospital-card";


    const mapUrl =
        `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;


    card.innerHTML = `

        <div class="card-top">

            <div class="hospital-icon">
                🏥
            </div>

            <div class="hospital-info">

                <span class="facility-label">
                    HEALTHCARE FACILITY
                </span>

                <h3>
                    ${escapeHTML(
                        hospital.name
                    )}
                </h3>

            </div>

        </div>


        <div class="address">

            📍
            ${escapeHTML(
                hospital.address
            )}

        </div>


        <span class="distance">

            ${formatDistance(
                hospital.distance
            )}

            away

        </span>


        <a
            class="map-btn"
            href="${mapUrl}"
            target="_blank"
            rel="noopener noreferrer"
        >

            🗺 Open in Google Maps

        </a>

    `;


    hospitalList.appendChild(
        card
    );

}


// ==========================================
// Calculate Distance
// ==========================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius =
        6371;


    const dLat =
        toRadians(
            lat2 - lat1
        );


    const dLon =
        toRadians(
            lon2 - lon1
        );


    const a =
        Math.sin(
            dLat / 2
        ) ** 2 +

        Math.cos(
            toRadians(lat1)
        ) *

        Math.cos(
            toRadians(lat2)
        ) *

        Math.sin(
            dLon / 2
        ) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return (
        earthRadius *
        c
    );

}


function toRadians(
    degrees
) {

    return (
        degrees *
        Math.PI /
        180
    );

}


// ==========================================
// Format Distance
// ==========================================

function formatDistance(
    distance
) {

    if (
        distance < 1
    ) {

        return (
            `${Math.round(
                distance * 1000
            )} m`
        );

    }


    return (
        `${distance.toFixed(1)} km`
    );

}


// ==========================================
// HTML Safety
// ==========================================

function escapeHTML(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==========================================
// Loading
// ==========================================

function showLoading() {

    if (loading) {

        loading.style.display =
            "flex";

    }

}


function hideLoading() {

    if (loading) {

        loading.style.display =
            "none";

    }

}


// ==========================================
// Error
// ==========================================

function showError(
    message
) {

    if (!errorBox) {
        return;
    }


    errorBox.innerHTML =
        escapeHTML(message)
            .replaceAll(
                "\n",
                "<br>"
            );


    errorBox.style.display =
        "block";

}


function clearMessages() {

    if (!errorBox) {
        return;
    }


    errorBox.style.display =
        "none";

    errorBox.innerHTML =
        "";

}