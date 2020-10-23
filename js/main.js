
let x = 4;
let y = 4;

let dokuBoard;

const win = new Audio('audio/San_Jose_Strut.mp3');

let fixed = false;

function message(text) {
	$('#solver-text').text(text);
	$('#modal-solve').modal();
}

$(document).ready(function() {

	loadBoard();

	loadPad();

	$('.square td').on('click', function() {
		if ($(this).hasClass('clue')) {
			x = $(this).attr('x');
			y = $(this).attr('x');
			$('.active').removeClass('active');
			$(this).addClass('active');
		}
	});

	$('.square td').on('contextmenu', function() {
		return false;
	});

	$('.digit').on('click', function() {
		const parent = $(this).parents('td[x]').eq(0);
		const pos = getPosition($(this));
		if (x == pos.x && y == pos.y) return;
		x = pos.x; y = pos.y;
		$('.active').removeClass('active');
		parent.addClass('active');
	});

	$('.digit').on('contextmenu', function() {
		if (isHighlighted($(this))) {
			const span = $(this);
			if (!span.text()) return;
			span.text('');
			$(this).parents('[x]').eq(0).children('.closed').eq(0).removeClass('closed');
			removeDigit();
		}
		return false;
	});

	$('.annotation td').on('click', function() {
		const parent = $(this).parents('td[x]').eq(0);
		const pos = getPosition($(this));
		if (x == pos.x && y == pos.y) {
			$(this).toggleClass('noted');
			return;
		}
		x = pos.x; y = pos.y;
		$('.active').removeClass('active');
		parent.addClass('active');
	});

	$('.annotation td').on('contextmenu', function() {
		if (isHighlighted($(this))) {
			const parent = $(this).parents('.annotation').eq(0);
			const element = $(this).parents('[x]').eq(0);
			const number = $(this).text();
			parent.addClass('closed');
			const span = element.children('span').eq(0);
			span.text(number);
			placeDigit(number);
		}
		return false;
	});

	$(document).keyup(function(e) {
		const element = $(`td[x="${ x }"][y="${ y }"]`);
		if (element.hasClass('clue')) return;
		switch(e.keyCode) {
			case 8: case 24: case 127:
				const span = element.children('span').eq(0);
				if (!!span.text()) {
					element.children('.annotation').eq(0).removeClass('closed');
					span.text('');
					removeDigit();
				} else element.find('.noted').removeClass('noted');
			break;
			case 49: case 50: case 51:
			case 52: case 53: case 54:
			case 55: case 56: case 57:
				element.children('.annotation').eq(0).addClass('closed');
				element.children('span').eq(0).text(e.keyCode - 48);
				placeDigit(e.keyCode - 48);
			break;
		}
	});

	$(document).keydown(function(e) {
		switch(e.keyCode) {
			case 38: // UP
				if (y == 0) break;
				$(`td[x="${ x }"][y="${ y }"]`).removeClass('active');
				y--;
				$(`td[x="${ x }"][y="${ y }"]`).addClass('active');
			break;
			case 40: // DOWN
				if (y == 8) break;
				$(`td[x="${ x }"][y="${ y }"]`).removeClass('active');
				y++;
				$(`td[x="${ x }"][y="${ y }"]`).addClass('active');
			break;
			case 37: // LEFT
				if (x == 0) break;
				$(`td[x="${ x }"][y="${ y }"]`).removeClass('active');
				x--;
				$(`td[x="${ x }"][y="${ y }"]`).addClass('active');
			break;
			case 39: // RIGHT
				if (x == 8) break;
				$(`td[x="${ x }"][y="${ y }"]`).removeClass('active');
				x++;
				$(`td[x="${ x }"][y="${ y }"]`).addClass('active');
			break;
		}
	});

	$('.pad').on('click', function() {
		const element = $(`td[x="${ x }"][y="${ y }"]`);
		if (element.hasClass('clue')) return;
		element.children('.annotation').eq(0).addClass('closed');
		const number = parseInt($(this).text());
		element.children('span').eq(0).text(number);
		placeDigit(number);
	});

	$('.x-pad').on('click', function() {
		const element = $(`td[x="${ x }"][y="${ y }"]`);
		if (element.hasClass('clue')) return;
		const span = element.children('span').eq(0);
		if (!!span.text()) {
			element.children('.annotation').eq(0).removeClass('closed');
			span.text('');
			removeDigit();
		} else element.find('.noted').removeClass('noted');
	});

	$('.r-pad').on('click', function() {
		$('.digit').each(function() {
			if (!$(this).text()) return;
			const p = $(this).parents('[x]').eq(0);
			const x = parseInt(p.attr('x'));
			const y = parseInt(p.attr('y'));
			dokuBoard[y][x] = 0;
			$(this).text('');
		});
		$('.noted').removeClass('noted');
		$('td[x]').each(function() {
			if ($(this).hasClass('clue')) return;
			$(this).children('.annotation').removeClass('closed');
		});
	});

	$('.s-pad').on('click', function() {
		let board = Array(9).fill().map(() => Array(9).fill(0));
		$('td[x]').each(function() {
			if (!$(this).hasClass('clue')) return;
			const x = parseInt($(this).attr('x'));
			const y = parseInt($(this).attr('y'));
			board[y][x] = dokuBoard[y][x];
		});
		if (isValidBoard(board) && solver(board)) {
			if (!check(board)) {
				message('This puzzle appears to have no solution!');
				return;
			}
			$('td[x]').each(function() {
				if ($(this).hasClass('clue')) return;
				const x = parseInt($(this).attr('x'));
				const y = parseInt($(this).attr('y'));
				$(this).children('.annotation').eq(0).addClass('closed');
				$(this).children('.digit').eq(0).text(board[y][x]);
			});
			dokuBoard = board;
			$('.noted').removeClass('noted');
			message('Solved successfully!');
			return;
		}
		message('This puzzle appears to have no solution!');
	});

	$('.e-pad').on('click', function() {
		if (fixed) {
			// edit board:
			// every clue has to become a digit
			$('.clue').each(function() {
				$(this).children('.clue-text').text('');
				const x = $(this).attr('x');
				const y = $(this).attr('y');
				$(this).children('.digit').text(dokuBoard[y][x]);
			});
			$('.clue').removeClass('clue');
			$(this).text('SET CLUES');
			$('.s-pad').prop('disabled', true);
		} else {
			// set board:
			let board = dokuBoard.map((a) => { return a.slice(); });
			if (checkMultiple(board)) {
				message('This puzzle has more than one unique solution!');
			}
			if (isValidBoard(board) && solver(board) && check(board)) {
				// valid clues:
				for (let i = 0; i < 9; i += 1) {
					for (let j = 0; j < 9; j += 1) {
						if (dokuBoard[i][j] != 0) {
							const element = $(`td[x="${ j }"][y="${ i }"]`);
							element.addClass('clue');
							element.children('.digit').eq(0).text('');
							element.children('.clue-text').eq(0).text(dokuBoard[i][j]);
						}
					}
				}
			} else {
				// invalid clues:
				message('Could not find a satisfying solution for the chosen clues!');
				return;
			}
			$(this).text('EDIT CLUES');
			$('.s-pad').prop('disabled', false);
		}
		fixed = !fixed;
	});

	$('.h-btn').click(() => {
		message("Insert the clues in the grid and press set clues to start or load a project.");
	});

	$('.s-project').click(() => {
		let project = {
			mode: fixed,
			active: {
				r: parseInt(y) + 1,
				c: parseInt(x) + 1
			},
			clues: [],
			notes: [],
			digits: []
		};
		$('.clue').each(function() {
			project.clues.push({
				r: parseInt($(this).attr('y')) + 1,
				c: parseInt($(this).attr('x')) + 1,
				clue: parseInt(
					$(this).children('.clue-text').eq(0).text()
				)
			});
		});
		$('.annotation').each((i, a) => {
			const notes = $(a).find('.noted');
			if (!notes.length) return;
			const parent = $(a).parents('td[x]').eq(0);
			let numbers = [];
			notes.each((i, n) => {
				numbers.push(parseInt($(n).text()));
			});
			project.notes.push({
				r: parseInt(parent.attr('y')) + 1,
				c: parseInt(parent.attr('x')) + 1,
				noted: numbers
			});
		});
		$('.digit').each(function() {
			if (!$(this).text().length) return;
			const parent = $(this).parents('td[x]').eq(0);
			project.digits.push({
				r: parseInt(parent.attr('y')) + 1,
				c: parseInt(parent.attr('x')) + 1,
				digit: parseInt($(this).text())
			});
		});
		project = JSON.stringify(project);
		$('#download-link').attr(
			'href',
			'data:text/json;charset=utf-8,' +
			encodeURIComponent(project)
		);
		$('#download-link').attr('download', 'Classic Doku.json');
		// Only trigger that works:
		document.getElementById('download-link').click();
	});

	$('.l-project').click(() => {
		document.getElementById("load-btn").click();
	});

	$('#load-btn').on('change', function(e) {
		if (e.target.files && e.target.files[0]) {
			e.target.files[0].text().then((json) => {
				loadProject(JSON.parse(json));
			});
		}
	});

	$('#doku-string').on('keypress', function(e) {
		return e.charCode > 47 && e.charCode < 58;
	});

	$('#string-btn').click(() => {
		let dokuString = '';
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (!dokuBoard[i][j]) {
					dokuString += '0';
					continue;
				}
				if ($(`td[x="${ j }"][y="${ i }"]`).hasClass('clue')) {
					dokuString += dokuBoard[i][j].toString();
					continue;
				}
				dokuString += '0';
			}
		}
		$('#doku-string').val(dokuString);
		$('#modal-string').modal();
	});

});

function loadProject(project) {
	$('.clue').removeClass('clue');
	$('.clue-text').text('');
	$('.digit').text('');
	$('.noted').removeClass('noted');
	$('.annotation').removeClass('closed');
	dokuBoard = [
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
	];
	$('.active').removeClass('active');
	x = project.active.c - 1;
	y = project.active.r - 1;
	$(`td[x="${ x }"][y="${ y }"]`).addClass('active');
	if (project.mode) {
		// Fixed mode:
		if (!fixed) {
			fixed = true;
			$('.e-pad').text('EDIT CLUES');
			$('.s-pad').prop('disabled', false);
		}
		for (const clue of project.clues) {
			const current = $(`td[x="${ clue.c - 1 }"][y="${ clue.r - 1 }"]`);
			current.addClass('clue');
			current.children('.annotation').addClass('closed');
			current.children('.clue-text').text(clue.clue);
		}
	} else {
		// Edit mode:
		if (fixed) {
			fixed = false;
			$('.e-pad').text('SET CLUES');
			$('.s-pad').prop('disabled', true);
		}
	}
	for (const digit of project.digits) {
		const current = $(`td[x="${ digit.c - 1 }"][y="${ digit.r - 1 }"]`);
		current.children('.annotation').addClass('closed');
		current.children('.digit').text(digit.digit);
	}
	for (const note of project.notes) {
		const current = $(`td[x="${ note.c - 1 }"][y="${ note.r - 1 }"]`);
		const tds = current.find('.annotation td');
		for (const n of note.noted) {
			for (const td of tds) {
				if ($(td).text() == n) {
					$(td).addClass('noted');
					break;
				}
			}
		}
	}
}

// Are there more than one solutions?
function checkMultiple(board) {
	// Find the last placeable digit:
	let clues = 0;
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (board[i][j]) clues++;
		}
	}
	if (clues < 17) return true;
	let solve = board.map((a) => { return a.slice(); });
	solver(solve); solve = JSON.stringify(solve);
	for (let i = 0; i < 5; i++) {
		let temp = board.map((a) => { return a.slice(); });
		solver(temp); temp = JSON.stringify(temp);
		if (temp != solve) return true;
	}
	return false;
}

// Is it a pseudo valid board?
function isValidBoard(board) {
	const isValidSudoku = (board) => {
		const obj = { 
			rows: { },    // 9 rows, each containing 9 cells across
			columns: { }, // 9 columns, each containing 9 cells down
			blocks: { },  // 9 blocks, each containing 3x3 cells inside
		};
		let isValid = true;
		loop1:
		for (let r = 0; r < board.length; r++) {
			for (let c = 0; c < board[r].length; c++) {
				const cellValue = board[r][c];
				if (cellValue == 0) continue;
				// 1: validate rows
				if (!obj.rows.hasOwnProperty(r)) {
					obj.rows[r] = { };
				}
				if (obj.rows[r].hasOwnProperty(cellValue)) {
					isValid = false;
					break loop1;
				} else obj.rows[r][cellValue] = null;
				// 2: validate columns
				if (!obj.columns.hasOwnProperty(c)) {
					obj.columns[c] = {};
				}
				if (obj.columns[c].hasOwnProperty(cellValue)) {
					isValid = false;
					break loop1;
				} else obj.columns[c][cellValue] = null;
				// 3: validate grid
				const b = getBlockNumber(r, c);
				if (!obj.blocks.hasOwnProperty(b)) {
					obj.blocks[b] = { };
				}
				if (obj.blocks[b].hasOwnProperty(cellValue)) {
					isValid = false;
					break loop1;
				} else obj.blocks[b][cellValue] = null;
			}
		}
		
		return isValid;
	};
	// if row = 8 & column = 5
	// then quotients = 2, 1
	// therefore blockNumber = 8
	const getBlockNumber = (row, column) => {
		const rowQuotient = parseInt(row / 3, 10);
		const columnQuotient = parseInt(column / 3, 10);
		let blockNumber;
		switch(`${rowQuotient}${columnQuotient}`) {
			case '00': blockNumber = 0; break;
			case '01': blockNumber = 1; break;
			case '02': blockNumber = 2; break;
			case '10': blockNumber = 3; break;
			case '11': blockNumber = 4; break;
			case '12': blockNumber = 5; break;
			case '20': blockNumber = 6; break;
			case '21': blockNumber = 7; break;
			case '22': blockNumber = 8; break;
		};
		return blockNumber;
	};
	return isValidSudoku(board);
}

// Solve for me please!
function solver(data) {
	const shuffle = (a) => {
		let c = a.length;
		let n, t;
		while (c) {
			n = Math.random() * c-- | 0;
			t = a[c];
			a[c] = a[n];
			a[n] = t;
		}
	}
	const isValid = (b, r, c, k) => {
		for (let i = 0; i < 9; i += 1) {
			const m = 3 * Math.floor(r / 3) + Math.floor(i / 3);
			const n = 3 * Math.floor(c / 3) + i % 3;
			if (b[r][i] == k || b[i][c] == k || b[m][n] == k) {
				return false;
			}
		}
		return true;
	};
	let n = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (data[i][j] == 0) {
				shuffle(n);
				for (let k = 0; k < 9; k++) {
					const w = n[k];
					if (isValid(data, i, j, w)) {
						data[i][j] = w;
						if (solver(data)) return true;
						data[i][j] = 0;
					}
				}
				return false;
			}
		}
	}
	return true;
}

// Did I win?
function check(board) {
	if (board === undefined) board = dokuBoard;
	const isV = (a) => { return Array.from(a).sort().join('') === '123456789' };
	const testRows = (b) => b.every(r => isV(r));
	const testColumns = (b) => {
		const columns = (b, n) => b.reduce((t, r) => [...t, r[n]], []);
		return [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ].every(i => isV(columns(b, i)));
	}
	const getSquares = (x, y, b) => {
		const getIndexes = (n) => {
			switch(n) {
				case 1: return [ 0, 1, 2 ];
				case 2: return [ 3, 4, 5 ];
				case 3: return [ 6, 7, 8 ];
			}
		}
		let v = [];
		const rows = getIndexes(x);
		const cols = getIndexes(y);
		rows.forEach(r => cols.forEach(c => v.push(b[r][c])));
		return v;
	};
	const testSquares = (b) => {
		const s = [ 1, 2, 3 ];
		return s.every(sX => {
			return s.every(sY => isV(getSquares(sX, sY, b)));
		});
	}
	return testRows(board) && testColumns(board) && testSquares(board);
}

// Is it full?
function isFull() {
	return dokuBoard.every(
		r => r.every(c => c != 0)
	);
}

function placeDigit(d) {
	dokuBoard[y][x] = parseInt(d);
	if (isFull() && check()) {
		win.play();
		message('Congratulations, you did it!');
	}
}

function removeDigit() {
	dokuBoard[y][x] = 0;
}

function getPosition(element) {
	const parent = element.parents('td[x]').eq(0);
	return {
		x: parent.attr('x'),
		y: parent.attr('y')
	};
}

function isHighlighted(element) {
	return $(element).parents('td[x]')
		   .eq(0).hasClass('active');
}

function loadPad() {
	let container = $('#pad-container');
	let html = '<table id="pad">';
	for (let i = 0; i < 3; i += 1) {
		html += '<tr>';
		for (let j = 0; j < 3; j += 1) {
			html += `<td><button class="pad">${ i * 3 + j + 1 }</button></td>`;
		}
		html += '</tr>';
	}
	html += '</table><button class="x-pad btn-pad"></button>';
	html += '<button class="r-pad btn-pad">RESET</button>';
	html += '<button class="s-pad btn-pad" disabled>SOLVE</button>';
	html += `<button class="e-pad btn-pad">${ fixed ? 'EDIT CLUES' : 'SET CLUES' }</button>`;
	container.append($(html));
}

function loadBoard() {
	dokuBoard = [
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
	];
	let container = $('#container');
	let html = '<table id="board">';
	for (let i = 0; i < 3; i += 1) {
		html += '<tr>';
		for (let j = 0; j < 3; j += 1) {
			html += '<td>';
			html += createTable(i, j, dokuBoard);
			html += '</td>';
		}
		html += '</tr>';
	}
	container.html(html + '</table>');
	$('td[x="4"][y="4"]').addClass('active');
}

function createTable(row, col, board) {
	let html = `<table class="square" sx="${ col }" sy="${ row }">`;
	for (let i = 0; i < 3; i += 1) {
		html += '<tr>';
		for (let j = 0; j < 3; j += 1) {
			let x = col * 3 + j;
			let y = row * 3 + i;
			const clue = board[y][x] != 0;
			html += `<td x="${ x }" y="${ y }"${ clue ? ' class="clue"' : '' }>`;
			html += `<span class="digit"></span>`;
			html += `<span class="clue-text">${ clue ? board[y][x] : '' }</span>`;
			html += createAnnotation(clue) + '</td>';
		}
		html += '</tr>';
	}
	return html + '</table>';
}

function createAnnotation(closed) {
	let html = `<table class="annotation${ closed ? ' closed' : '' }">`;
	for (let i = 0; i < 3; i += 1) {
		html += '<tr>';
		for (let j = 0; j < 3; j += 1) {
			html += `<td>${ i * 3 + j + 1 }</td>`;
		}
		html += '</tr>';
	}
	return html + '</table>';
}

