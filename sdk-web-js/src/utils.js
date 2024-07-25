/**
* Set dimensions of html element
* @param {HTMLElement} elmt 
* @param {number} width 
* @param {number} height 
*/
export function setElementDimensions(elmt, width, height) {
    elmt.setAttribute("style", `width: ${width}px; height: ${height}px`)
}