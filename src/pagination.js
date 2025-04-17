export const getPagination = (currentPage, total, delta=3) => {
	const range = [];
	const rangeWithDot = [];
	let j;
	const start = Math.max(2, Number(currentPage) - delta);
	const end = Math.min(total - 1, Number(currentPage) + delta);

	range.push(1);

	for (let i = start; i <= end; i++){
		range.push(i);
	}

	total > 1 && range.push(total);

	for (let i of range){
		if (j){
			if (i - j === 2){
				rangeWithDot.push(j + 1);
			} else if (i - j !== 1) {
				rangeWithDot.push('...');
			}
		}
		rangeWithDot.push(i);
		j = i;
	}
	return rangeWithDot;
}
