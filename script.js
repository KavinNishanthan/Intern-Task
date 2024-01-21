let currentPage = 1;
let reposPerPage = 10;
let totalRepos;
let filteredRepositories = [];

// Add this function to extract parameters from the URL
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Retrieve the username parameter from the URL
const usernameParam = getParameterByName('username');

// Use the retrieved usernameParam in your existing logic
if (usernameParam) {
  // Set the input field value to the retrieved username
  document.getElementById('username').value = usernameParam;

  // Call the function to fetch and display repositories
  getRepositories();
}

async function getRepositories() {
  const username = document.getElementById('username').value;
  const repoSearch = document.getElementById('repoSearch').value;
  const loader = document.getElementById('loader');

  loader.style.display = 'block';

  try {
    // Getting Userdetails
    const response = await fetch(`https://api.github.com/users/${username}`);
    const userData = await response.json();

    document.getElementById('profile-img').src = userData.avatar_url;
    document.getElementById('user-name').innerText = userData.name || 'No Name provided.';
    document.getElementById('user-bio').innerText = userData.bio || 'No Bio provided.';
    document.getElementById('user-location').innerText = userData.location || 'No Location provided.';
    document.getElementById('user-twitter').innerText =
      `Twitter: ${userData.twitter_username}` || 'No Twitter-Name provided.';
    document.getElementById('user-link').innerHTML = `<a href="${userData.url}" target="_blank">${userData.url}</a>`;

    // Getting Repo details
    const repoResponse = await fetch(`https://api.github.com/users/${username}/repos`);
    const repositories = await repoResponse.json();

    // Filter repositories based on search query
    filteredRepositories = repositories.filter((repo) => repo.name.toLowerCase().includes(repoSearch.toLowerCase()));

    displayRepositories(filteredRepositories);
  } catch (error) {
    console.error('Error fetching repositories:', error);
  } finally {
    // Hide loader after fetching data
    loader.style.display = 'none';
  }
}

function updateReposPerPage() {
  reposPerPage = parseInt(document.getElementById('reposPerPage').value, 10);
  currentPage = 1;
  getRepositories();
}

function filterRepositories() {
  currentPage = 1;
  getRepositories();
}

function displayRepositories(repositories) {
  const repoContainer = document.querySelector('.repo-container');
  repoContainer.innerHTML = '';

  const startIndex = (currentPage - 1) * reposPerPage;
  const endIndex = startIndex + reposPerPage;
  const displayedRepos = repositories.slice(startIndex, endIndex);

  displayedRepos.forEach((repo) => {
    const repoCard = document.createElement('div');
    repoCard.classList.add('repo-card');

    const title = document.createElement('h4');
    title.textContent = repo.name;
    title.style.color = 'blue';

    const description = document.createElement('h6');
    description.textContent = repo.description || 'No description provided.';

    const languages = document.createElement('div');

    if (repo.language != null) {
      languages.classList.add('languages-container');
      const languageButton = document.createElement('div');
      languageButton.textContent = repo.language;
      languages.appendChild(languageButton);
    } else {
      // Handle the case when there is no language
      languages.classList.add('languages-container');
      const noLanguageText = document.createElement('span');
      noLanguageText.textContent = 'No language specified';
      languages.appendChild(noLanguageText);
    }

    repoCard.appendChild(title);
    repoCard.appendChild(description);
    repoCard.appendChild(languages);

    repoContainer.appendChild(repoCard);
  });
  // Update pagination
  updatePagination(repositories.length);
}

function updatePagination(totalRepos) {
  const totalPages = Math.ceil(totalRepos / reposPerPage);
  const paginationList = document.querySelector('.pagination ul');

  // Clear previous pagination links
  paginationList.innerHTML = '';

  // Add previous button
  paginationList.innerHTML += `<li class="page-item">
          <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>`;

  // Add page links
  for (let i = 1; i <= totalPages; i++) {
    paginationList.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${i})">${i}</a></li>`;
  }

  // Add next button
  paginationList.innerHTML += `<li class="page-item">
          <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>`;

  // Enable/disable previous and next buttons based on current page
  paginationList.childNodes[0].classList.toggle('disabled', currentPage === 1);
  paginationList.childNodes[paginationList.childNodes.length - 1].classList.toggle(
    'disabled',
    currentPage === totalPages
  );
}

function goToPage(pageNumber) {
  currentPage = pageNumber;
  getRepositories();
}
