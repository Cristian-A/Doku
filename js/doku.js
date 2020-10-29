
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
	let solved = board.map((a) => { return a.slice(); });
	solve(solved); solved = JSON.stringify(solved);
	for (let i = 0; i < 5; i++) {
		let temp = board.map((a) => { return a.slice(); });
		solve(temp); temp = JSON.stringify(temp);
		if (temp != solved) return true;
	}
	return false;
}

// Is k valid in position [ x, y ]
function isValid(b, x, y, k) {
	const t = b[y][x];
	b[y][x] = 0;
	for (let i = 0; i < 9; i++) {
		const m = 3 * Math.floor(y / 3) + Math.floor(i / 3);
		const n = 3 * Math.floor(x / 3) + i % 3;
		if (b[y][i] == k || b[i][x] == k || b[m][n] == k) {
			b[y][x] = t;
			return false;
		}
	}
	b[y][x] = t;
	return true;
}

// Is it a pseudo valid board?
function isValidBoard(board) {
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (!board[i][j]) continue;
			if (!isValid(board, j, i, board[i][j])) {
				return false;
			}
		}
	}
	return true;
}

// Solve for me please!
function solve(board) {
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
	let n = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (board[i][j] == 0) {
				shuffle(n);
				for (let k = 0; k < 9; k++) {
					if (isValid(board, j, i, n[k])) {
						board[i][j] = n[k];
						if (solve(board)) return true;
						board[i][j] = 0;
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
function isFull(board) {
	return board.every(
		r => r.every(c => c != 0)
	);
}
