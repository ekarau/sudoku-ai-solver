export const checkIsHighlighted = (r, c, selectedCell) => {
  if (!selectedCell)
    return false;

  const { r: selR, c: selC } = selectedCell;

  if (selR === r && selC === c)
    return false;

  const sameRow = (r === selR);
  const sameCol = (c === selC);
  const sameBox = Math.floor(r / 3) === Math.floor(selR / 3) && 
                  Math.floor(c / 3) === Math.floor(selC / 3);

  return sameRow || sameCol || sameBox;
};