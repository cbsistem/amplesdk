/*
 * Ample SDK - JavaScript GUI Framework
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 * See: http://www.amplesdk.com/about/licensing/
 *
 */

var cXULElement_treechildren	= function() {
	// Public Collections
	this.items	= new ample.classes.NodeList;
};
cXULElement_treechildren.prototype	= new cXULElement("treechildren");

// Public Properties
cXULElement_treechildren.prototype.tree	= null;

// Public Methods
cXULElement_treechildren.prototype.reflow	= function() {
	var nPrimaryCol	= this.tree.head._getPrimaryColIndex();
	if (nPrimaryCol ==-1)
		return;

	var aStack	= [];
	for (var oElement = this; !(oElement instanceof cXULElement_tree); oElement = oElement.parentNode.parentNode)
		aStack.unshift(oElement);
	this._refresh(aStack, nPrimaryCol);
};

cXULElement_treechildren.prototype._refresh	= function(aStack, nPrimaryCol) {
	var nDepth		= aStack.length,
		oChildren	= aStack[nDepth - 1],
		bTreeLines	= this.tree.attributes["treelines"] != "false",
		nItems		= oChildren.items.length;

	for (var nItem = 0, oItem, oElementDOM; nItem < nItems; nItem++) {
		// Path
		oItem		= oChildren.items[nItem];
		oElementDOM	= oItem.row.cells[nPrimaryCol].$getContainer("label");

		if (bTreeLines) {
			// Line
			for (var nIndex = 0; nIndex < nDepth - 1; nIndex++)
				oElementDOM.childNodes[nIndex].className = "xul-treecell-line" +(aStack[nIndex + 1].parentNode == aStack[nIndex + 1].parentNode.parentNode.items[aStack[nIndex + 1].parentNode.parentNode.items.length - 1] ? "" : " xul-treecell-line-regular");

			// Leaf
			oElementDOM.childNodes[nDepth - 1].className	= "xul-treecell-line xul-treecell-line-" +(nItem == nItems - 1 ? "last" : "next");
		}

		// Toc
		if (oItem.attributes["container"] == "true") {
			// Step In
			if (oItem.children)
				this._refresh(aStack.concat(oItem.children), nPrimaryCol);

			// Add toc +/-
			oElementDOM.childNodes[nDepth - 1].className = "xul-treecell--toc" +(oChildren.items[nItem].attributes["open"] == "true" ? " xul-treecell--toc_open" : "");
		}
	}
};

// Class events handlers
cXULElement_treechildren.handlers	= {
	"DOMAttrModified":	function(oEvent) {
		if (oEvent.target == this) {
			if (oEvent.attrName == "hidden") {
				for (var nIndex = 0; nIndex < this.items.length; nIndex++) {
					this.items[nIndex].setAttribute("hidden", oEvent.newValue);
					if (this.items[nIndex].children && this.items[nIndex].attributes["open"] != "false")
						this.items[nIndex].children.setAttribute("hidden", oEvent.newValue);
				}
			}
		}
	},
	"DOMNodeInserted":	function(oEvent) {
		var oItem	= oEvent.target;
		if (oItem.parentNode == this)
			if (oItem instanceof cXULElement_treeitem) {
				// 1. Update own items collection
				var oItemNext	= oItem.nextSibling;
				if (oItemNext)
					this.items.$add(oItem, this.items.$indexOf(oItemNext));
				else
					this.items.$add(oItem);

				// 2. Update tree items collection
				var oItemPrevious	= oItem.previousSibling;
				if (oItemPrevious)
					while (oItemPrevious.children && oItemPrevious.children.items.length)
						oItemPrevious	= oItemPrevious.children.items[oItemPrevious.children.items.length - 1];
				else
					oItemPrevious	= oItem.parentNode.parentNode;
				//
				if (oItemPrevious instanceof cXULElement_treeitem)
					this.tree.items.$add(oItem, this.tree.items.$indexOf(oItemPrevious) + 1);
				else
					this.tree.items.$add(oItem);
			}
	},
	"DOMNodeRemoved":	function(oEvent) {
		var oItem	= oEvent.target;
		if (oItem.parentNode == this)
			if (oItem instanceof cXULElement_treeitem) {
				// Remove from selection
				if (this.tree.selectedItems.$indexOf(oItem) !=-1)
					this.tree.removeItemFromSelection(oItem);

				this.items.$remove(oItem);
				this.tree.items.$remove(oItem);
			}
	}
};

cXULElement_treechildren.prototype.$mapAttribute	= function(sName, sValue) {
	if (sName == "hidden") {
		// Do not let cXULElement map
	}
	else
		cXULElement.prototype.$mapAttribute.call(this, sName, sValue);
};

// TODO: Temp hack
cXULElement_treechildren.prototype.$getContainer	= function(sName) {
	return sName == "gateway" ? this.parentNode.$getContainer("gateway") : null;
};

// Register Element
ample.extend(cXULElement_treechildren);
