/*
 * Ample SDK - JavaScript GUI Framework
 *
 * Copyright (c) 2009 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 * See: http://www.amplesdk.com/about/licensing/
 *
 */

var cAMLNode	= function(){};

// nsIDOMNode

// Constants
cAMLNode.ELEMENT_NODE				= 1;
cAMLNode.ATTRIBUTE_NODE				= 2;
cAMLNode.TEXT_NODE					= 3;
cAMLNode.CDATA_SECTION_NODE			= 4;
cAMLNode.ENTITY_REFERENCE_NODE		= 5;
cAMLNode.ENTITY_NODE				= 6;
cAMLNode.PROCESSING_INSTRUCTION_NODE= 7;
cAMLNode.COMMENT_NODE				= 8;
cAMLNode.DOCUMENT_NODE				= 9;
cAMLNode.DOCUMENT_TYPE_NODE			= 10;
cAMLNode.DOCUMENT_FRAGMENT_NODE		= 11;
cAMLNode.NOTATION_NODE				= 12;

// Public Properties
cAMLNode.prototype.nodeType			= null;
cAMLNode.prototype.nodeName			= null;
cAMLNode.prototype.nodeValue		= null;
cAMLNode.prototype.ownerDocument	= null;
cAMLNode.prototype.localName		= null;
cAMLNode.prototype.namespaceURI		= null;
cAMLNode.prototype.prefix			= null;
cAMLNode.prototype.attributes		= null;
cAMLNode.prototype.childNodes		= null;
cAMLNode.prototype.firstChild		= null;
cAMLNode.prototype.lastChild		= null;
cAMLNode.prototype.nextSibling		= null;
cAMLNode.prototype.previousSibling	= null;
cAMLNode.prototype.parentNode		= null;

// nsIDOM3Node
cAMLNode.prototype.baseURI		= null;
cAMLNode.prototype.textContent	= null;

// Constants
cAMLNode.DOCUMENT_POSITION_DISCONNECTED	= 1;
cAMLNode.DOCUMENT_POSITION_PRECEDING	= 2;
cAMLNode.DOCUMENT_POSITION_FOLLOWING	= 4;
cAMLNode.DOCUMENT_POSITION_CONTAINS		= 8;
cAMLNode.DOCUMENT_POSITION_CONTAINED_BY	= 16;
cAMLNode.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC	= 32;

// Private Properties
cAMLNode.prototype.$listeners	= null;

function fAMLNode_getBaseURI(oNode) {
	var sBaseUri	= '';
	for (var oParent = oNode, sUri; oParent; oParent = oParent.parentNode)
		if (oParent.nodeType == cAMLNode.ELEMENT_NODE && (sUri = oParent.attributes["xml:base"]))
			sBaseUri	= fUtilities_resolveUri(sUri, sBaseUri);
	return sBaseUri;
};

function fAMLNode_getTextContent(oNode) {
	for (var nIndex = 0, aText = [], oChild; oChild = oNode.childNodes[nIndex]; nIndex++)
		if (oChild.nodeType == cAMLNode.TEXT_NODE || oChild.nodeType == cAMLNode.CDATA_SECTION_NODE)
			aText.push(oChild.data);
		else
		if (oChild.nodeType == cAMLNode.ELEMENT_NODE && oChild.firstChild)
			aText.push(fAMLNode_getTextContent(oChild));
	return aText.join('');
};

// nsIDOMNode
function fAMLNode_appendChild(oParent, oNode)
{
	// Remove element from previous location
	if (oNode.parentNode) {
		// Fire Mutation event
		var oEvent = new cAMLMutationEvent;
		oEvent.initMutationEvent("DOMNodeRemoved", true, false, oNode.parentNode, null, null, null, null);
		fAMLNode_dispatchEvent(oNode, oEvent);

		//
	    fAMLNode_removeChild(oNode.parentNode, oNode);
	}

	// Set DOM properties
    oNode.parentNode	= oParent;

    var oLast	= oParent.lastChild;
    if (oLast)
    {
        oNode.previousSibling	= oLast;
        oLast.nextSibling	= oNode;
    }
    else
    	oParent.firstChild	= oNode;
    oParent.lastChild	= oNode;

    oParent.childNodes.$add(oNode);

	// Fire Mutation event
    var oEvent = new cAMLMutationEvent;
    oEvent.initMutationEvent("DOMNodeInserted", true, false, oParent, null, null, null, null);
    fAMLNode_dispatchEvent(oNode, oEvent);

	return oNode;
};

cAMLNode.prototype.appendChild	= function(oNode)
{
	// Validate arguments
	fGuard(arguments, [
		["node",	cAMLNode]
	]);

	// Additional check: do not allow adding document nodes as children
	if (oNode.nodeType == cAMLNode.DOCUMENT_NODE)
		throw new cAMLException(cAMLException.HIERARCHY_REQUEST_ERR);

	// Additional check: if document has documentElement already, no other children can be added
	if (this.nodeType == cAMLNode.DOCUMENT_NODE && this.lastChild && this.lastChild.nodeType == cAMLNode.ELEMENT_NODE)
		throw new cAMLException(cAMLException.HIERARCHY_REQUEST_ERR);

	return fAMLNode_appendChild(this, oNode);
};

function fAMLNode_insertBefore(oParent, oNode, oBefore)
{
	// Save index
	var nIndex	= oParent.childNodes.$indexOf(oBefore);

	// Remove element from previous location
	if (oNode.parentNode) {
		// Fire Mutation event
		var oEvent = new cAMLMutationEvent;
		oEvent.initMutationEvent("DOMNodeRemoved", true, false, oNode.parentNode, null, null, null, null);
		fAMLNode_dispatchEvent(oNode, oEvent);

		//
		fAMLNode_removeChild(oNode.parentNode, oNode);
	}

	// Set DOM properties
    oNode.parentNode	= oParent;

    var oPrevious	= oBefore.previousSibling;
	if (oPrevious)
	{
		oNode.previousSibling	= oPrevious;
		oPrevious.nextSibling	= oNode;
	}
	else
		oParent.firstChild	= oNode;

	oNode.nextSibling	= oBefore;
	oBefore.previousSibling	= oNode;

	oParent.childNodes.$add(oNode, nIndex);

	// Fire Mutation event
    var oEvent = new cAMLMutationEvent;
    oEvent.initMutationEvent("DOMNodeInserted", true, false, oParent, null, null, null, null);
    fAMLNode_dispatchEvent(oNode, oEvent);

	return oNode;
};

cAMLNode.prototype.insertBefore	= function(oNode, oBefore)
{
	// Validate arguments
	fGuard(arguments, [
		["node",	cAMLNode],
		["before",	cAMLNode, false, true]
	]);

	// Additional check: do not allow adding document nodes as children
	if (oNode.nodeType == cAMLNode.DOCUMENT_NODE)
		throw new cAMLException(cAMLException.HIERARCHY_REQUEST_ERR);

	// Additional check: if document has documentElement already, no other children can be added
	if (this.nodeType == cAMLNode.DOCUMENT_NODE && this.lastChild && this.lastChild.nodeType == cAMLNode.ELEMENT_NODE)
		throw new cAMLException(cAMLException.HIERARCHY_REQUEST_ERR);

	if (oBefore) {
		if (this.childNodes.$indexOf(oBefore) !=-1)
			return fAMLNode_insertBefore(this, oNode, oBefore);
		else
			throw new cAMLException(cAMLException.NOT_FOUND_ERR);
	}
	else
		return fAMLNode_appendChild(this, oNode);
};

function fAMLNode_removeChild(oParent, oNode)
{
	var oNext		= oNode.nextSibling,
		oPrevious	= oNode.previousSibling;

	if (oNext)
		oNext.previousSibling	= oPrevious;
	else
		oParent.lastChild	= oPrevious;

	if (oPrevious)
		oPrevious.nextSibling	= oNext;
	else
		oParent.firstChild	= oNext;

	// Reset DOM properties
    oNode.parentNode  		= null;
	oNode.previousSibling	= null;
	oNode.nextSibling		= null;

    return oParent.childNodes.$remove(oNode);
};

cAMLNode.prototype.removeChild	= function(oNode)
{
	// Validate arguments
	fGuard(arguments, [
		["node",	cAMLNode]
	]);

    if (this.childNodes.$indexOf(oNode) !=-1)
    	return fAMLNode_removeChild(this, oNode);
    else
        throw new cAMLException(cAMLException.NOT_FOUND_ERR);
};

function fAMLNode_replaceChild(oParent, oNode, oOld)
{
	fAMLNode_insertBefore(oParent, oNode, oOld);
	return fAMLNode_removeChild(oParent, oOld);
};

cAMLNode.prototype.replaceChild	= function(oNode, oOld)
{
	// Validate arguments
	fGuard(arguments, [
		["node",	cAMLNode],
		["old",		cAMLNode, false, true]
	]);

    if (this.childNodes.$indexOf(oOld) !=-1)
    	return fAMLNode_replaceChild(this, oNode, oOld);
    else
    	throw new cAMLException(cAMLException.NOT_FOUND_ERR);
};

function fAMLNode_cloneNode(oNode, bDeep)
{
	var oClone;
	switch (oNode.nodeType) {
		case cAMLNode.ELEMENT_NODE:
			// Create Element
			oClone	= fAMLDocument_createElementNS(oNode.ownerDocument, oNode.namespaceURI, oNode.nodeName);

			// Copy Attributes
			for (var sName in oNode.attributes)
				if (oNode.attributes.hasOwnProperty(sName))
					oClone.attributes[sName]	= oNode.attributes[sName];

			// Append Children
			if (bDeep)
				for (var nIndex = 0; nIndex < oNode.childNodes.length; nIndex++)
					fAMLNode_appendChild(oClone, fAMLNode_cloneNode(oNode.childNodes[nIndex], bDeep));
			break;

		case cAMLNode.TEXT_NODE:
			oClone	= fAMLDocument_createTextNode(oNode.ownerDocument, oNode.data);
			break;

		case cAMLNode.CDATA_SECTION_NODE:
			oClone	= fAMLDocument_createCDATASection(oNode.ownerDocument, oNode.data);
			break;

		default:
			throw new cAMLException(cAMLException.NOT_SUPPORTED_ERR);
	}
	return oClone;
};

cAMLNode.prototype.cloneNode	= function(bDeep)
{
	// Validate arguments
	fGuard(arguments, [
		["deep",	cBoolean]
	]);

	return fAMLNode_cloneNode(this, bDeep);
};

// nsIDOM3Node
cAMLNode.prototype.getFeature		= function(sFeature, sVersion)
{
	throw new cAMLException(cAMLException.NOT_SUPPORTED_ERR);
};

cAMLNode.prototype.getUserData	= function(sKey)
{
	throw new cAMLException(cAMLException.NOT_SUPPORTED_ERR);
};

cAMLNode.prototype.setUserData	= function(sKey, sData, fHandler)
{
	throw new cAMLException(cAMLException.NOT_SUPPORTED_ERR);
};

cAMLNode.prototype.isEqualNode 	= function(oNode)
{
	throw new cAMLException(cAMLException.NOT_SUPPORTED_ERR);
};

cAMLNode.prototype.isSameNode 	= function(oNode)
{
	throw new cAMLException(cAMLException.NOT_SUPPORTED_ERR);
};

function fAMLNode_lookupPrefix(oNode, sNameSpaceURI)
{
	for (var aPrefixes = {}, sPrefix; oNode && oNode.nodeType != cAMLNode.DOCUMENT_NODE; oNode = oNode.parentNode)
	{
		if (oNode.namespaceURI == sNameSpaceURI)
			return oNode.prefix;
		else
		if (oNode.nodeType == cAMLNode.ELEMENT_NODE)
			for (var sAttribute in oNode.attributes)
				if (oNode.attributes.hasOwnProperty(sAttribute) && sAttribute.indexOf("xmlns" + ':') == 0)
				{
					sPrefix	= sAttribute.substr(6);
					if (oNode.attributes[sAttribute] == sNameSpaceURI)
						return sPrefix in aPrefixes ? '' : sPrefix;
					else
						aPrefixes[sPrefix]	= true;
				}
	}
	return null;
};

cAMLNode.prototype.lookupPrefix	= function(sNameSpaceURI)
{
	// Validate arguments
	fGuard(arguments, [
		["namespaceURI",	cString, false, true]
	]);

	return fAMLNode_lookupPrefix(this, sNameSpaceURI);
};

cAMLNode.prototype.isDefaultNamespace	= function(sNameSpaceURI)
{
/*
	if (!oElement.prefix)
		return oElement.namespaceURI == sNameSpaceURI;
	else
		return oElement.parentNode ? oElement.parentNode.isDefaultNamespace(sNameSpaceURI) : false;
*/
	throw new cAMLException(cAMLException.NOT_SUPPORTED_ERR);
};

function fAMLNode_lookupNamespaceURI(oNode, sPrefix)
{
	for (; oNode && oNode.nodeType != cAMLNode.DOCUMENT_NODE; oNode = oNode.parentNode)
		if (oNode.prefix == sPrefix)
			return oNode.namespaceURI;
		else
		if (oNode.nodeType == cAMLNode.ELEMENT_NODE)
			for (var sAttribute in oNode.attributes)
				if (oNode.attributes.hasOwnProperty(sAttribute) && sAttribute.indexOf("xmlns" + ':') == 0 && sAttribute.substr(6) == sPrefix)
					return oNode.attributes[sAttribute];
	return null;
};

cAMLNode.prototype.lookupNamespaceURI	= function(sPrefix)
{
	// Validate arguments
	fGuard(arguments, [
		["prefix",	cString, false, true]
	]);

	// Invoke actual implementation
	return fAMLNode_lookupNamespaceURI(this, sPrefix);
};

function fAMLNode_compareDocumentPosition(oNode, oChild)
{
	if (oChild == oNode)
		return 0;

	var aChain1	= [], nLength1, oNode1,
		aChain2	= [], nLength2, oNode2,
		oElement, nIndex;
	//
	for (oElement = oNode; oElement; oElement = oElement.parentNode)
		aChain1.push(oElement);
	for (oElement = oChild; oElement; oElement = oElement.parentNode)
		aChain2.push(oElement);
	// If nodes are from different documents or if they do not have common top, they are disconnected
	if (((oNode.ownerDocument || oNode) != (oChild.ownerDocument || oChild)) || (aChain1[aChain1.length - 1] != aChain2[aChain2.length - 1]))
		return cAMLNode.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC | cAMLNode.DOCUMENT_POSITION_DISCONNECTED;
	//
	for (nIndex = cMath.min(nLength1 = aChain1.length, nLength2 = aChain2.length); nIndex; --nIndex)
		if ((oNode1 = aChain1[--nLength1]) != (oNode2 = aChain2[--nLength2])) {
			if (!oNode2.nextSibling)
				return cAMLNode.DOCUMENT_POSITION_FOLLOWING;
			if (!oNode1.nextSibling)
				return cAMLNode.DOCUMENT_POSITION_PRECEDING;
			for (oElement = oNode2.previousSibling; oElement; oElement = oElement.previousSibling)
				if (oElement == oNode1)
					return cAMLNode.DOCUMENT_POSITION_FOLLOWING;
			return cAMLNode.DOCUMENT_POSITION_PRECEDING;
		}
	//
	return nLength1 < nLength2 ? cAMLNode.DOCUMENT_POSITION_FOLLOWING | cAMLNode.DOCUMENT_POSITION_CONTAINED_BY : cAMLNode.DOCUMENT_POSITION_PRECEDING | cAMLNode.DOCUMENT_POSITION_CONTAINS;
};

cAMLNode.prototype.compareDocumentPosition	= function(oChild)
{
	// Validate arguments
	fGuard(arguments, [
		["node",	cAMLNode]
	]);

	return fAMLNode_compareDocumentPosition(this, oChild);
};

/*
cAMLNode.prototype.lookupPrefix	= function(sNameSpaceURI)
{
	if (!sNameSpaceURI)
		return null;

	switch (this.nodeType)
	{
		case cAMLNode.ELEMENT_NODE:
			return this.lookupNamespacePrefix(sNameSpaceURI);

		case cAMLNode.DOCUMENT_NODE:
			return this.documentElement.lookupNamespacePrefix(sNameSpaceURI);

		case cAMLNode.ENTITY_NODE:
		case cAMLNode.NOTATION_NODE:
		case cAMLNode.DOCUMENT_FRAGMENT_NODE:
		case cAMLNode.DOCUMENT_TYPE_NODE:
			return null;  // type is unknown

		case cAMLNode.ATTRIBUTE_NODE:
			if (this.ownerElement)
				return this.ownerElement.lookupNamespacePrefix(sNameSpaceURI);
			return null;

		default:
			if (this.parentNode)
				// EntityReferences may have to be skipped to get to it
				return this.parentNode.lookupNamespacePrefix(sNameSpaceURI);
			return null;
	}
};

cAMLNode.prototype.lookupNamespacePrefix	= function(sNameSpaceURI)
{
	if (this.namespaceURI && this.namespaceURI == sNameSpaceURI && this.prefix && this.lookupNamespaceURI(this.prefix) == sNameSpaceURI)
		return this.prefix;

	for (var i = 0, iLength = this.attributes.length; i < iLength; i++)
		if (this.attributes[i].prefix == "xmlns" && this.attributes[i].nodeValue == sNameSpaceURI && this.lookupNamespaceURI(this.attributes[i].localName) == sNameSpaceURI)
			return this.attributes[i].localName;

	if (this.parentNode && this.parentNode.nodeType == cAMLNode.ELEMENT_NODE)
		// EntityReferences may have to be skipped to get to it
		return this.parentNode.lookupNamespacePrefix(sNameSpaceURI);
	return null;
};

cAMLNode.prototype.lookupNamespaceURI	= function(sPrefix)
{
	switch (this.nodeType)
	{
		case cAMLNode.ELEMENT_NODE:
			if (this.namespaceURI && this.prefix == sPrefix)
				return this.namespaceURI;

			for (var i = 0, iLength = this.attributes.length; i < iLength; i++)
				if (this.attributes[i].prefix == "xmlns" && this.attributes[i].localName == sPrefix)
					// non default namespace
					return this.attributes[i].nodeValue || null;
				else
				if (this.attributes[i].localName == "xmlns" && sPrefix == null)
					// default namespace
					return this.attributes[i].nodeValue || null;

			if (this.parentNode && this.parentNode.nodeType == cAMLNode.ELEMENT_NODE)
				// EntityReferences may have to be skipped to get to it
				return this.parentNode.lookupNamespaceURI(sPrefix);
			return null;

		case cAMLNode.DOCUMENT_NODE:
			return this.documentElement.lookupNamespaceURI(sPrefix);

		case cAMLNode.ENTITY_NODE:
		case cAMLNode.NOTATION_NODE:
		case cAMLNode.DOCUMENT_TYPE_NODE:
		case cAMLNode.DOCUMENT_FRAGMENT_NODE:
			return null;

		case cAMLNode.ATTRIBUTE_NODE:
			if (this.ownerElement)
				return this.ownerElement.lookupNamespaceURI(sPrefix);
			else
				return null;

		default:
			if (this.parentNode && this.parentNode.nodeType == cAMLNode.ELEMENT_NODE)
				// EntityReferences may have to be skipped to get to it
				return this.parentNode.lookupNamespaceURI(sPrefix);
			else
				return null;
	}
}
*/

// nsIDOMEventTarget
function fAMLEventTarget_addEventListener(oNode, sType, fHandler, bUseCapture)
{
	if (!oNode.$listeners)
		oNode.$listeners	= {};
	if (!oNode.$listeners[sType])
		oNode.$listeners[sType]	= [];
	for (var nIndex = 0, aListeners = oNode.$listeners[sType], bCapture = bUseCapture == true; nIndex < aListeners.length; nIndex++)
		if (aListeners[nIndex][0] == fHandler && aListeners[nIndex][1] == bCapture)
			return;
	oNode.$listeners[sType].push([fHandler, bCapture]);
};

cAMLNode.prototype.addEventListener		= function(sType, fHandler, bUseCapture)
{
	// Validate arguments
	fGuard(arguments, [
		["eventType",	cString],
		["listener",	cObject],
		["useCapture",	cBoolean,	true]
	]);

	fAMLEventTarget_addEventListener(this, sType, fHandler, bUseCapture);
};

function fAMLEventTarget_removeEventListener(oNode, sType, fHandler, bUseCapture)
{
	if (oNode.$listeners && oNode.$listeners[sType])
		for (var nIndex = 0, aListeners = oNode.$listeners[sType], bCapture = bUseCapture == true; nIndex < aListeners.length; nIndex++)
			if (aListeners[nIndex][0] == fHandler && aListeners[nIndex][1] == bCapture)
			{
				oNode.$listeners[sType]	= aListeners.slice(0, nIndex).concat(aListeners.slice(nIndex + 1));
				if (!oNode.$listeners[sType].length)
					delete oNode.$listeners[sType];
				return;
			}
};

cAMLNode.prototype.removeEventListener	= function(sType, fHandler, bUseCapture)
{
	// Validate arguments
	fGuard(arguments, [
		["eventType",	cString],
		["listener",	cObject],
		["useCapture",	cBoolean,	true]
	]);

	// Invoke actual implementation
	fAMLEventTarget_removeEventListener(this, sType, fHandler, bUseCapture);
};

function fAMLNode_executeHandler(oNode, fHandler, oEvent) {
	try {
		if (typeof fHandler == "function")
			fHandler.call(oNode, oEvent);
		else
		if (typeof fHandler.handleEvent == "function")
			fHandler.handleEvent.call(fHandler, oEvent);
		else
			throw new cAMLException(cAMLException.AML_MEMBER_MISSING_ERR, null, ["handleEvent"]);
	}
	catch (oException) {
		if (oException instanceof cAMLException) {
			var oErrorHandler	= oAMLConfiguration_values["error-handler"];
			if (oErrorHandler)
				oErrorHandler.handleError(new cAMLError(oException.message, cAMLError.SEVERITY_ERROR, oException));
		}
		throw oException;
	}
};

function fAMLNode_handleEvent(oNode, oEvent) {
	var sType	= oEvent.type;

	// Process inline handler
    if (oEvent.eventPhase != cAMLEvent.CAPTURING_PHASE && oNode['on' + sType])
    	fAMLNode_executeHandler(oNode, oNode['on' + sType], oEvent);

	// Notify listeners
    if (oNode.$listeners && oNode.$listeners[sType])
    	for (var nIndex = 0, aListeners = oNode.$listeners[sType]; nIndex < aListeners.length && !oEvent._stoppedImmediately; nIndex++)
    		if (aListeners[nIndex][1] == (oEvent.eventPhase == cAMLEvent.CAPTURING_PHASE))
    			fAMLNode_executeHandler(oNode, aListeners[nIndex][0], oEvent);

	// Event default actions implementation
	if (oEvent.eventPhase != cAMLEvent.CAPTURING_PHASE && !oEvent.defaultPrevented)
		if (oNode.nodeType == 1 || oNode.nodeType == 2) {
			var cNode	=(oNode.nodeType == 1 ? oAMLImplementation_elements : oAMLImplementation_attributes)[oNode.namespaceURI + '#' + oNode.localName];
			if (cNode && cNode.handlers && cNode.handlers[sType])
				cNode.handlers[sType].call(oNode, oEvent);
		}
};

function fAMLNode_handleCaptureOnTargetEvent(oNode, oEvent) {
	var sType	= oEvent.type;
    if (oNode.$listeners && oNode.$listeners[sType])
   		for (var nIndex = 0, aListeners = oNode.$listeners[sType]; nIndex < aListeners.length && !oEvent._stoppedImmediately; nIndex++)
   			if (aListeners[nIndex][1] == true)
   				fAMLNode_executeHandler(oNode, aListeners[nIndex][0], oEvent);
};

cAMLNode.prototype.hasAttributes	= function()
{
	if (this.attributes)
		for (var sAttribute in this.attributes)
			if (this.attributes.hasOwnProperty(sAttribute))
				return true;
	return false;
};

cAMLNode.prototype.normalize		= function()
{
	throw new cAMLException(cAMLException.NOT_SUPPORTED_ERR);
};

cAMLNode.prototype.isSupported	= function()
{
	throw new cAMLException(cAMLException.NOT_SUPPORTED_ERR);
};

function fAMLNode_routeEvent(oEvent)
{
	var aTargets	= [],
		nLength		= 0,
		nCurrent	= 0,
		bUIEvent	= oEvent instanceof cAMLUIEvent,
		nDisabled	=-1,
		oTarget		= oEvent.target;

	// Populate stack targets (...document-fragment, document, #document)
	for (var oNode = oTarget; oNode; oNode = oNode.parentNode) {
		if (bUIEvent && oNode.nodeType == cAMLNode.ELEMENT_NODE && !oNode.$isAccessible())
			nDisabled	= nLength;
		aTargets[nLength++]	= oNode;
	}

	// Propagate event
	while (!oEvent._stopped) {
		switch (oEvent.eventPhase) {
			case cAMLEvent.CAPTURING_PHASE:
				if (--nCurrent > 0)
					oEvent.currentTarget	= aTargets[nCurrent];
				else {
					oEvent.eventPhase		= cAMLEvent.AT_TARGET;
					oEvent.currentTarget	= oTarget;
					// Special case: handling capture-phase events on target
					fAMLNode_handleCaptureOnTargetEvent(oTarget, oEvent);
					// Do not handle target if there is disabled element
					if (nDisabled >-1)
						continue;
				}
				break;

			case cAMLEvent.AT_TARGET:
				// if event does not bubble, return
				if (!oEvent.bubbles)
					return;
				// if event current target doesn't have a parent
				if (nCurrent < 0)
					return;
				oEvent.eventPhase	= cAMLEvent.BUBBLING_PHASE;
				// Do not handle bubbling between target and disabled element
				if (nDisabled >-1)
					nCurrent	= nDisabled;
				// No break left intentionally
			case cAMLEvent.BUBBLING_PHASE:
				if (++nCurrent < nLength)
					oEvent.currentTarget	= aTargets[nCurrent];
				else
					return;
				break;

			default:
				// Set current target
				if (nLength > 1) {
					nCurrent	= nLength - 1;
					oEvent.eventPhase	= cAMLEvent.CAPTURING_PHASE;
					oEvent.currentTarget= aTargets[nCurrent];
				}
				else {
					nCurrent	= 0;
					oEvent.eventPhase	= cAMLEvent.AT_TARGET;
					oEvent.currentTarget= oTarget;
					// Special case: handling capture-phase events on target
					fAMLNode_handleCaptureOnTargetEvent(oTarget, oEvent);
				}
		}

//->Source
//console.log(oEvent.currentTarget);
//<-Source

		// Handle event
		fAMLNode_handleEvent(oEvent.currentTarget, oEvent);
	}
};

function fAMLNode_dispatchEvent(oNode, oEvent)
{
	// Set event target and currentTarget
	oEvent.target	= oNode;

	// Start event flow
	fAMLNode_routeEvent(oEvent);

	return !oEvent.defaultPrevented;
};

cAMLNode.prototype.dispatchEvent	= function(oEvent)
{
	// Validate arguments
	fGuard(arguments, [
		["event",	cAMLEvent]
	]);

	// Invoke actual implementation
	return fAMLNode_dispatchEvent(this, oEvent);
};
//->Source
/*
cAMLNode.prototype.selectNodes	= function(sXPath)
{
	var oDocument	= this.nodeType == cAMLNode.DOCUMENT_NODE ? this : this.ownerDocument,
		oXMLDocument= new cDOMParser().parseFromString(oDocument.toXML(), "text/xml"),
		aNodeList	= new cAMLNodeList,
		aXMLNodeList= [],
		oNode,
		oXMLNode;

	// Run XPath on XMLDocument
	if (oXMLDocument.evaluate)
	{
		// Find Context node
		var oResult;
		if (this.nodeType == cAMLNode.DOCUMENT_NODE)
			oXMLNode	= oXMLDocument;
		else
		{
			oResult	= oXMLDocument.evaluate('/' + '/' + '*[@_="' + this.uniqueID + '"]', oXMLDocument, null, 0, null);
			oXMLNode	= oResult.iterateNext();
		}

		// Run query
		oResult		= oXMLDocument.evaluate(sXPath, oXMLNode, oXMLDocument.createNSResolver(oXMLNode), 0, null);
		while (oNode = oResult.iterateNext())
			aXMLNodeList[aXMLNodeList.length]	= oNode;
	}
	else
	{
		// Find Context node
		if (this.nodeType == cAMLNode.DOCUMENT_NODE)
			oXMLNode	= oXMLDocument;
		else
			oXMLNode	= oXMLDocument.selectSingleNode('/' + '/' + '*[@_="' + this.uniqueID + '"]');

		// Run query
		aXMLNodeList	= oXMLNode.selectNodes(sXPath);
	}

	// Convert results to AML nodes
	for (var nIndex = 0, nLength = aXMLNodeList.length; nIndex < nLength; nIndex++)
	{
		oNode	= aXMLNodeList[nIndex];
		switch (oNode.nodeType)
		{
			case cAMLNode.ELEMENT_NODE:
				aNodeList.$add(oAMLDocument_all[oNode.getAttribute('_')]);
				break;

			case cAMLNode.ATTRIBUTE_NODE:
				aNodeList.$add(oNode.nodeValue);
				break;

			case cAMLNode.TEXT_NODE:
			case cAMLNode.CDATA_NODE:
				aNodeList.$add(oNode.nodeValue);
				break;

			case cAMLNode.DOCUMENT_NODE:
				aNodeList.$add(oDocument);
				break;
		}
	}
	return aNodeList;
};

cAMLNode.prototype.selectSingleNode	= function(sXPath)
{
	var aNodeList	= this.selectNodes(sXPath);
	return aNodeList.length ? aNodeList[0] : null;
};
*/
//<-Source
cAMLNode.prototype.$getContainer	= function(sName)
{
    return null;
};

cAMLNode.prototype.$getTag	= function()
{
	return '';
};

function fAMLNode_toXML(oNode)
{
	var aHtml	= [],
		nIndex	= 0;
//->Source
	var nDepth	= arguments.length > 1 ? arguments[1] : 1;
	aHtml.push(new cArray(nDepth).join('\t'));
//<-Source
	switch (oNode.nodeType) {
		case cAMLNode.ELEMENT_NODE:
			var sName, oAttributes;
			aHtml.push('<' + oNode.nodeName);
			oAttributes	= oNode.attributes;
			for (sName in oAttributes)
				if (oAttributes.hasOwnProperty(sName))
					aHtml.push(' ' + sName + '=' + '"' + fUtilities_encodeEntities(oAttributes[sName]) + '"');
//			aHtml.push(' ' + '_' + '=' + '"' + oNode.uniqueID + '"');
			if (oNode.hasChildNodes()) {
				aHtml.push('>');
//->Source
				aHtml.push('\n');
				nDepth++;
//<-Source
				while (nIndex < oNode.childNodes.length)
					aHtml.push(fAMLNode_toXML(oNode.childNodes[nIndex++]
//->Source
						, nDepth
//<-Source
					));
//->Source
				nDepth--;
				aHtml.push('\n');
				aHtml.push(new cArray(nDepth).join('\t'));
//<-Source
				aHtml.push('</' + oNode.nodeName + '>');
			}
			else
				aHtml.push('/>');
			break;

		case cAMLNode.TEXT_NODE:
			aHtml.push(oNode.nodeValue);
			break;

		case cAMLNode.CDATA_SECTION_NODE:
			aHtml.push('<![CDATA[' + oNode.nodeValue + ']]>');
			break;

		case cAMLNode.PROCESSING_INSTRUCTION_NODE:
			aHtml.push('<?' + oNode.nodeName + ' ' + oNode.nodeValue + '?>');
			break;

		case cAMLNode.COMMENT_NODE:
			aHtml.push('<!--' + oNode.nodeValue + '-->');
			break;

		case cAMLNode.DOCUMENT_FRAGMENT_NODE:
		case cAMLNode.DOCUMENT_NODE:
			while (nIndex < oNode.childNodes.length)
				aHtml.push(fAMLNode_toXML(oNode.childNodes[nIndex++]
//->Source
					, nDepth
//<-Source
				));
			break;
/*
		case cAMLNode.NOTATION_NODE:
		case cAMLNode.DOCUMENT_TYPE_NODE:
		case cAMLNode.ENTITY_REFERENCE_NODE:
		case cAMLNode.ENTITY_NODE:
		case cAMLNode.ATTRIBUTE_NODE:
*/
		default:
			throw new cAMLException(cAMLException.NOT_SUPPORTED_ERR);
	}
//->Source
	if (oNode.nextSibling)
		aHtml.push('\n');
//<-Source
	return aHtml.join('');
};

cAMLNode.prototype.toXML	= function()
{
	return fAMLNode_toXML(this);
};