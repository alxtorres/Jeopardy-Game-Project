let categories = [];

const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;

function getCategoryIds() {
  return _.sampleSize(_.range(1, 10000), NUM_CATEGORIES);
}

async function getCategory(catId) {
  const response = await axios.get(`http://jservice.io/api/category?id=${catId}`);
  const category = response.data;
  const clues = _.sampleSize(category.clues, NUM_CLUES_PER_CAT).map(clue => ({
    question: clue.question,
    answer: clue.answer,
    showing: null
  }));

  return { title: category.title, clues };
}

async function fillTable() {
  const jeopardyTable = $('<table>').attr('id', 'jeopardy');
  const thead = $('<thead>');
  const tbody = $('<tbody>');

  const categoryIds = getCategoryIds();
  const categoriesPromises = categoryIds.map(id => getCategory(id));
  categories = await Promise.all(categoriesPromises);

  const categoryTitles = $('<tr>');
  categories.forEach(category => {
    categoryTitles.append($('<td>').text(category.title));
  });

  thead.append(categoryTitles);
  jeopardyTable.append(thead);

  for (let i = 0; i < NUM_CLUES_PER_CAT; i++) {
    const row = $('<tr>');
    for (let j = 0; j < NUM_CATEGORIES; j++) {
      row.append($('<td>').text('?').attr('data-x', j).attr('data-y', i));
    }
    tbody.append(row);
  }

  jeopardyTable.append(tbody);
  $('body').append(jeopardyTable);
}

function handleClick(evt) {
  const x = evt.target.dataset.x;
  const y = evt.target.dataset.y;
  const clue = categories[x].clues[y];

  if (!clue.showing) {
    evt.target.innerText = clue.question;
    clue.showing = 'question';
  } else if (clue.showing === 'question') {
    evt.target.innerText = clue.answer;
    clue.showing = 'answer';
  }
}

function showLoadingView() {
  $('body').append($('<div>').addClass('loader'));
}

function hideLoadingView() {
  $('.loader').remove();
}

async function setupAndStart() {
  showLoadingView();
  await fillTable();
  hideLoadingView();
}

$('body').on('click', 'td', handleClick);

setupAndStart();
