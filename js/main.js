/* =====================================================
   AC Mtaani - Interactive Dashboard Logic
   ===================================================== */

// Configuration: Maps card types to your Google Form URLs
const FORM_URLS = {
    signIn: { 
        title: "Daily Sign-In", 
        url: "https://docs.google.com/forms/d/e/1FAIpQLScyJrGQjMwthJAHWB2cb7CgKce8sgw6DhwbJvr_R7n_zorhcA/viewform?embedded=true" 
    },
    attendance: { 
        title: "Program Attendance", 
        url: "https://docs.google.com/forms/d/1izqLJV0DEJhmOv2ATW3NjBNV9TTIz3hAbNGG4ROVbS8/viewform?embedded=true" 
    },
    feedback: { 
        title: "Member Feedback", 
        url: "https://docs.google.com/forms/d/e/1FAIpQLScH6nT4k8ASch8slJOvTqgsD59NblRcJ5XfMYtyQCrDCPCjQw/viewform?embedded=true" 
    },
    request: { 
        title: "Resource Request (Books)", 
        url: "https://docs.google.com/forms/d/1nNl6vDeOheQKtZMH1lbmoCuysHbRIYggL1AS-c2mneQ/viewform?embedded=true" 
    },
    volunteer: { 
        title: "Volunteer Program", 
        url: "https://docs.google.com/forms/d/1iI5v0dLyxGY_SzRtfdBHTu43JORBHlUZZmMtf6TeMws/viewform?embedded=true" 
    }
};

// Event Data (You can update this list manually)
const eventsData = [
    {
        title: "Business & Entrepreneurship Training",
        date: "Jan 31, 2026",
        time: "9:00 AM - 4:00 PM",
        desc: "Learn Business Model Canvas & Growth Hacking.",
        link: "https://docs.google.com/forms/d/19Vy74GI68ibyHoO0j8MrRng9MgQrbWC89ukxdyRWx1s/viewform"
    }
];

// =====================================================
// 1. SEAMLESS FORM HANDLERS
// =====================================================
// Function to open the modal and load the form
function openForm(type) {
    const formConfig = FORM_URLS[type];
    const overlay = document.getElementById('formOverlay');
    const iframe = document.getElementById('googleFormIframe');
    const title = document.getElementById('formTitle');
    const spinner = document.getElementById('formSpinner');

    if (formConfig) {
        title.innerText = formConfig.title;
        spinner.style.display = 'flex'; // Show loading animation
        iframe.src = formConfig.url;    // Load the ACTUAL Google Form
        
        overlay.classList.add('active'); // Show the popup
        document.body.style.overflow = 'hidden'; // Stop background scroll
    }
}

function closeForm() {
    const overlay = document.getElementById('formOverlay');
    const iframe = document.getElementById('googleFormIframe');
    
    overlay.classList.remove('active');
    iframe.src = ""; // Clear form to save memory
    document.body.style.overflow = ''; 
}

// =====================================================
// 2. EVENTS MODAL HANDLERS
// =====================================================

function openEventsModal() {
    // You can either open a modal or your specific RSVP form
    window.open("https://docs.google.com/forms/d/19Vy74GI68ibyHoO0j8MrRng9MgQrbWC89ukxdyRWx1s/viewform", "_blank");
}

function closeEventsModal() {
    document.getElementById('eventsModal').classList.remove('active');
    document.body.style.overflow = '';
}

// =====================================================
// 3. CONTACT MODAL HANDLERS
// =====================================================

function openContactModal() {
    document.getElementById('contactModal').classList.add('active');
}

function closeContactModal() {
    document.getElementById('contactModal').classList.remove('active');
}

window.onclick = function(event) {
    const overlay = document.getElementById('formOverlay');
    if (event.target == overlay) {
        closeForm();
    }
}

// Log for debugging
console.log("AC Mtaani Dashboard Loaded Successfully");
