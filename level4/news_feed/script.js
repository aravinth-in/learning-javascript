"use strict";

console.log("--- News Feed App ---");

// --- API Configuration ---
const NEWS_API_KEY = '';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/';

// --- DOM Elements ---
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const categoriesContainer = document.querySelector('.categories');
const categoryButtons = document.querySelectorAll('.category-btn');
const newsContainer = document.getElementById('newsContainer');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const lightModeBtn = document.getElementById('lightMode');
const darkModeBtn = document.getElementById('darkMode');
const breakingNewsTicker = document.getElementById('breakingNewsTicker');
const tickerContent = document.querySelector('.ticker-content');

// --- Global State ---
let currentCategory = 'general';
let currentSearchQuery = '';
let currentBreakingNews = [];
let currentTickerIndex = 0;
let tickerIntervalId;

// --- Functions ---
function showMessage(elementToShow, messageText = '') {
    loadingMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    newsContainer.innerHTML = ''; // Clear news content when showing messages

    if (elementToShow) {
        elementToShow.textContent = messageText;
        elementToShow.style.display = 'block';
    }
}

async function fetchNews(type, params = {}) {
    showMessage(loadingMessage, 'Loading news...');
    errorMessage.textContent = ''; // Clear previous errors

    const url = new URL(`${NEWS_API_BASE_URL}${type}`);
    // Add common parameters
    url.searchParams.append('apiKey', NEWS_API_KEY);
    url.searchParams.append('language', 'en'); // Fetch English news

    // Add specific parameters
    for (const key in params) {
        if (params[key]) { // Only append if value is not empty/null
            url.searchParams.append(key, params[key]);
        }
    }

    console.log("DEBUG: Fetching from URL:", url.toString());

    try {
        const response = await fetch(url.toString()); // Await the fetch operation

        // Check for HTTP errors (e.g., 404, 500) - fetch doesn't reject for these
        if (!response.ok) {
            let errorDetail = await response.text(); // Get response body for more info
            try {
                const errorJson = JSON.parse(errorDetail);
                if (errorJson.message) errorDetail = errorJson.message;
            } catch (e) {
                // Not JSON, use as is
            }
            throw new Error(`HTTP error! Status: ${response.status}. Detail: ${errorDetail}`);
        }

        const data = await response.json(); // Await parsing the JSON body

        if (data.status === 'error') {
            throw new Error(`API Error: ${data.code} - ${data.message}`);
        }

        if (data.articles.length === 0) {
            showMessage(newsContainer, "No news found for your query/category. Try something else!");
            return [];
        }

        loadingMessage.style.display = 'none'; // Hide loading message
        return data.articles;

    } catch (error) {
        console.error("Fetch News Error:", error);
        // Display user-friendly error message
        let userMessage = "Failed to load news. ";
        if (error.message.includes("Failed to fetch")) {
            userMessage += "Please check your internet connection or the API URL.";
        } else if (error.message.includes("API Error:")) {
            userMessage += error.message.replace("API Error:", "News API returned an error:");
            if (error.message.includes("apiKeyMissing") || error.message.includes("apiKeyInvalid")) {
                userMessage += " Make sure your NEWS_API_KEY is correct in script.js!";
            } else if (error.message.includes("rateLimited")) {
                userMessage += " You've hit the API rate limit. Please wait and try again.";
            } else if (error.message.includes("maximumResultsReached")) {
                userMessage += " Too many results, try a more specific search.";
            }
        } else if (error.message.includes("HTTP error!")) {
             userMessage += error.message;
        } else {
            userMessage += "An unexpected error occurred.";
        }
        showMessage(errorMessage, userMessage);
        return []; // Return empty array on error
    }
}

function displayNews(articles) {
    newsContainer.innerHTML = ''; // Clear existing news
    loadingMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    if (articles.length === 0) {
        showMessage(newsContainer, "No news to display.");
        return;
    }

    articles.forEach(article => {
        // Skip articles without a title or image (optional, but good for clean display)
        if (!article.title || !article.urlToImage) {
            return;
        }

        const newsCard = document.createElement('div');
        newsCard.classList.add('news-card');

        // Sanitize article properties or provide fallbacks
        const title = article.title || 'No Title Available';
        const description = article.description || '';
        const imageUrl = article.urlToImage || 'https://via.placeholder.com/300x200?text=No+Image'; // Placeholder if no image
        const url = article.url || '#';
        const sourceName = article.source.name || 'Unknown Source';
        const publishedAt = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Date Unknown';

        newsCard.innerHTML = `
            <img src="${imageUrl}" alt="${title}">
            <div class="content">
                <h2>${title}</h2>
                <p>${description}</p>
                <div class="source-date">${sourceName} - ${publishedAt}</div>
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="read-more">Read More &rarr;</a>
            </div>
        `;
        newsContainer.appendChild(newsCard);
    });
}

async function loadTopHeadlines() {
    const articles = await fetchNews('top-headlines', { category: currentCategory });
    displayNews(articles);
}


async function loadSearchResults(query) {
    const articles = await fetchNews('everything', { q: query, sortBy: 'relevancy' }); // 'everything' for search
    displayNews(articles);
}

// --- Event Listeners ---

// Search Button Click
searchButton.addEventListener('click', () => {
    currentSearchQuery = searchInput.value.trim();
    if (currentSearchQuery) {
        // Deactivate all category buttons when performing a search
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        loadSearchResults(currentSearchQuery);
    } else {
        // If search is empty, revert to loading top headlines for current category
        loadTopHeadlines();
    }
});

// Search Input 'Enter' Key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click(); // Simulate a click on the search button
    }
});

// Category Button Clicks
categoriesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('category-btn')) {
        // Remove 'active' class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Add 'active' class to the clicked button
        e.target.classList.add('active');

        currentCategory = e.target.dataset.category;
        searchInput.value = ''; // Clear search input when category is selected
        currentSearchQuery = ''; // Reset search query
        loadTopHeadlines(); // Load news for the selected category
    }
});

// --- Theme Switching ---
function setLightTheme() {
    document.body.classList.remove('dark-mode');
    lightModeBtn.classList.add('active-theme');
    darkModeBtn.classList.remove('active-theme');
    localStorage.setItem('theme', 'light');
}

function setDarkMode() {
    document.body.classList.add('dark-mode');
    darkModeBtn.classList.add('active-theme');
    lightModeBtn.classList.remove('active-theme');
    localStorage.setItem('theme', 'dark');
}

lightModeBtn.addEventListener('click', setLightTheme);
darkModeBtn.addEventListener('click', setDarkMode);

// Apply saved theme on load
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        setDarkMode();
    } else {
        setLightTheme(); // Default to light if no theme saved or it's 'light'
    }
}

async function fetchBreakingHeadlines() {
    console.log("DEBUG: Fetching breaking headlines...");
    const url = new URL(`${NEWS_API_BASE_URL}top-headlines`);
    url.searchParams.append('apiKey', NEWS_API_KEY);
    url.searchParams.append('language', 'en');
    url.searchParams.append('category', 'general'); // General breaking news
    url.searchParams.append('pageSize', 5); // Fetch a small number of top headlines

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            let errorDetail = await response.text();
            try {
                const errorJson = JSON.parse(errorDetail);
                if (errorJson.message) errorDetail = errorJson.message;
            } catch (e) { /* not JSON */ }
            throw new Error(`HTTP error! Status: ${response.status}. Detail: ${errorDetail}`);
        }

        const data = await response.json();
        if (data.status === 'error') {
            throw new Error(`API Error: ${data.code} - ${data.message}`);
        }

        currentBreakingNews = data.articles.filter(article => article.title && article.url); // Ensure valid articles
        if (currentBreakingNews.length === 0) {
            displayBreakingHeadlines([{ title: "No breaking news available right now.", url: "#" }]);
        } else {
            displayBreakingHeadlines(currentBreakingNews);
        }

    } catch (error) {
        console.error("Breaking News Fetch Error:", error);
        displayBreakingHeadlines([{ title: "Failed to load breaking news.", url: "#" }]);
    }
}

function displayBreakingHeadlines(articles) {
    tickerContent.innerHTML = '';
    if (articles.length === 0) {
        tickerContent.innerHTML = '<div class="ticker-item">No breaking news available.</div>';
        return;
    }

    articles.forEach(article => {
        const tickerItem = document.createElement('a'); // Use 'a' for clickable headlines
        tickerItem.classList.add('ticker-item');
        tickerItem.href = article.url;
        tickerItem.target = '_blank';
        tickerItem.rel = 'noopener noreferrer';
        tickerItem.textContent = article.title;
        tickerContent.appendChild(tickerItem);
    });

    if (articles.length > 1) {
        startTickerCycle();
    } else {
        // If only one item, just display it statically
        tickerContent.style.justifyContent = 'center'; // Center the single item
    }
}

function startTickerCycle() {
    if (tickerIntervalId) {
        clearInterval(tickerIntervalId);
    }

    currentTickerIndex = 0;
    const items = tickerContent.querySelectorAll('.ticker-item');
    if (items.length === 0) return;

    // Hide all items initially except the first one
    items.forEach((item, index) => {
        item.style.display = (index === 0) ? 'inline-block' : 'none';
    });

    tickerIntervalId = setInterval(() => {
        items[currentTickerIndex].style.display = 'none';
        currentTickerIndex = (currentTickerIndex + 1) % items.length;
        items[currentTickerIndex].style.display = 'inline-block';

    }, 5000); // Cycle every 5 seconds
}


document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    loadTopHeadlines();

    fetchBreakingHeadlines();
    setInterval(fetchBreakingHeadlines, 300000); // Refresh breaking news every 5 minutes (300000 ms)
});