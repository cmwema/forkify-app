// model
import * as model from './model.js';

// views
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

// polyfilling modules
import 'core-js/stable';
import 'regenerator-runtime'; //polyfills async await

// if (module.hot) {
//   module.hot.accept();
// }

const recipeContainer = document.querySelector('.recipe');

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0. update results view to highlight the selected result
    resultsView.update(model.getSearchResultsPage());

    // 1.load recipe
    await model.loadRecipe(id); //async function

    // 2. rendering recipe
    recipeView.render(model.state.recipe);

    // test
    // controlServings();

    // update bookmarks
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // Display spinner for the results side bar
    resultsView.renderSpinner();

    // get the query from input
    const query = searchView.getQuery();
    // guard clause if there is no query
    if (!query) return;

    // load the search results
    await model.loadSearchResults(query);

    // render results
    resultsView.render(model.getSearchResultsPage());

    // render the initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goto) {
  // console.log('Pagination : ');
  // console.log(goto);
  // render  NEW results
  resultsView.render(model.getSearchResultsPage(goto));

  // render NEW pagination
  paginationView.render(model.state.search);
};

const controlServings = function (updateTo) {
  // update the recipe servings
  if (updateTo < 0) return;

  model.updateServings(updateTo);

  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // add or remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookMark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // update the recipe view to show a bookmarked icon filled
  recipeView.render(model.state.recipe);

  // render bookmarks to the bookmarks hover
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner
    addRecipeView.renderSpinner();

    // console.log(newRecipe);
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);

    // render recipe view
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    //render bookmarks
    bookmarksView.render(model.state.bookmarks);

    // change id in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close the form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(`${err} 💥`);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);

  // render event subcriber
  recipeView.addHandlerRender(controlRecipes);

  recipeView.addHandlerUpdateServings(controlServings);

  recipeView.adddHandlerAddBookmark(controlAddBookmark);

  // search subscriber
  searchView.addHandlerSearch(controlSearchResults);

  paginationView.addHandlerClick(controlPagination);

  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
