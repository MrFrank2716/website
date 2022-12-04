// Animations for the armor stand model generator by MrGarretto

$('#animate-button').click(function() {
    $('#animate').show().animate({
        bottom: 0,
        opacity: 1
    }, 300);
    updateKeyframeButtons();
});

$('#animate-close').click(function() {
    $('#animate').show().animate({
        bottom: '-150px',
        opacity: 0
    }, 300);
});

// Right clicking on keyframes

// Clear when clicking elsewhere

$(document).mousedown(function(event) {
    if (Array.prototype.slice.call(document.getElementsByClassName('rightclick-keyframe-menu-part')).indexOf(event.target) === -1) {

        window.setTimeout(function() {

            $('#rightclick-keyframe-menu').hide();

        }, 1);

    }
   
});

if (document.addEventListener) {
    document.getElementById('animate-canvas').addEventListener('contextmenu', function(e) {
        
        window.setTimeout(function() {

            rightclickKeyframe();

        }, 2);

        e.preventDefault();
    }, false);
} else {
    document.getElementById('animate-canvas').attachEvent('oncontextmenu', function() {
        
        window.setTimeout(function() {

            rightclickKeyframe();

        }, 2);

        window.event.returnValue = false;
    });
}

// Buttons in the right-click menu
$('.rightclick-keyframe-btn').click(function() {
    // Changin the easing of a section
    var newval = $(this).attr('btn');
    
    for (var i = 0; i < tweening.length; i++) {
        if (playheadOnSection(tweening[i].pos)) {
            tweening[i].ease = newval; // Set the easing of the selected section to the 'btn' attribute of the button pressed
        }
    }

    // Close the menu after doing the action
    $('#rightclick-keyframe-menu').hide();
});

function updateRightclickMenuButtons() {
    // Make the selected one grayed out and update the rate textbox to the current selected area's values

    for (var i = 0; i < tweening.length; i++) {
        if (playheadOnSection(tweening[i].pos)) {
            
            $('.rightclick-keyframe-btn').each(function() {
                if ($(this).attr('btn') === tweening[i].ease) {
                    // Already selected
                    $(this).css('opacity', '0.5').attr('disabled', true).removeClass('clickable');
                } else {
                    // Not selected
                    $(this).css('opacity', '1').attr('disabled', false).addClass('clickable');
                }
            });

            // Update the rate textbox
            $('#interpolate-amount').val(tweening[i].rate);

        }
    }
}

function rightclickKeyframe() {

    var sectionUnderSelection = false;
    for (var i = 0; i < tweening.length; i++) {
        if (playheadOnSection(tweening[i].pos)) {
            sectionUnderSelection = true;
        }
    }

    if (sectionUnderSelection) {
        $('#rightclick-keyframe-menu').show().css({
            'left': mouseAbsolute.x + 'px',
            'top': (mouseAbsolute.y - $('#rightclick-keyframe-menu').height()) + 'px'
        });
    }

    updateRightclickMenuButtons();
}

$('#interpolate-amount').change(function() {
    // Round to integer and get value
    if ($(this).val().length === 0) {
        var inputAmount = 0;
    } else {
        var inputAmount = parseInt($(this).val());
    }

    $(this).val(inputAmount);

    // Change the amount on the selected area
    for (var i = 0; i < tweening.length; i++) {
        if (playheadOnSection(tweening[i].pos)) {
            tweening[i].rate = inputAmount;
        }
    }

    $('#interpolate-amount-label-after').html(inputAmount === 1 ? 'tick' : 'ticks'); // Show 'tick' instead of 'ticks' if the amount is exactly 1
});


// Setting interpolation inbetween keyframes by holding shift

var tweening = [];

// Not used any more
// var holdingShift = false;
// $(document).bind('keydown', 'shift', function() {
//     holdingShift = true;
// });

// $(document).bind('keyup', 'shift', function() {
//     holdingShift = false;
// });

var timelineSelection = [-1, -1]; // first item is start of selection (ontick), and second item is end of selection (ontick)

// Animation Settings

$('#animate-settings-length').change(function() {
    var label = 'seconds';
    var ticks = parseInt($('#animate-settings-length').val());
    $('#animate-settings-length').val(ticks);
    if (ticks == 1) {
        label = 'second';
    }
    $('#animate-settings-seconds-display').html((ticks / 20) + ' ' + label);

    settings.animate.ticks = ticks;

    // Remove keyframes that are off of the animation timeline after changing the length
    for (var i = 0; i < keyframes.length; i++) {
        if (keyframes[i].ontick > ticks) {
            keyframes.splice(i, 1);
            i--;
        }
    }
    // Remove interpolated sections that have the second end point off of the timeline
    for (var i = 0; i < tweening.length; i++) {
        if (tweening[i].pos[1] > ticks) {
            tweening.splice(i, 1);
            i--;
        }
    }

    // If the playhead is moved off the timeline (to the right), move it to the new rightmost tick
    if (animatePlayhead.ontick > ticks - 1) {
        animatePlayhead.ontick = ticks - 1;
    }

    // Update the playhead so it is still on a tick
    animatePlayhead.x = animatePlayhead.ontick * tickSpacing();
});

// Add tween button
function tweenButton(input) {
    if (input === 'disable') {
        $('#animate-add-tweening').css('opacity', '0.5').removeClass('animate-keyframe-button-enabled').attr('tooltip', 'You must make a selection by dragging in the<br>timeline before you can add an interpolated section!');
    } else {
        // Enable the button
        $('#animate-add-tweening').css('opacity', '1').addClass('animate-keyframe-button-enabled').removeAttr('tooltip');
    }
}

function deleteTweenButton(input) {
    if (input === 'disable') {
        $('#animate-delete-tweening').css('opacity', '0.5').removeClass('animate-keyframe-button-enabled').attr('tooltip', 'You must select an interpolated area first!');
    } else {
        // Enable the button
        $('#animate-delete-tweening').css('opacity', '1').addClass('animate-keyframe-button-enabled').removeAttr('tooltip');
    }
}

tweenButton('disable');

deleteTweenButton('disable');

$('#animate-add-tweening').click(function() {
    // If the tooltip is there, that means that the button is disabled
    var tooltipAttr = $(this).attr('tooltip');
    if (tooltipAttr !== undefined && tooltipAttr !== false)
        return;

    if (timelineSelection[1] != -1) {

        // Make sure that there are keyframes at the beginning and end of the newly-created area

        var selectionMin = Math.min.apply(Math, timelineSelection);
        var selectionMax = Math.max.apply(Math, timelineSelection);

        var previousPlayheadPos = animatePlayhead.ontick;

        if (keyframeAt(selectionMin) === false) {

            animatePlayhead.ontick = selectionMin;

            updateKeyframeAt(animatePlayhead.ontick);

        }

        if (keyframeAt(selectionMax) === false) {

            animatePlayhead.ontick = selectionMax;

            updateKeyframeAt(animatePlayhead.ontick);

        }

        animatePlayhead.ontick = parseInt(previousPlayheadPos); // Reset the playhead back to the position it was originally at

        // Add to tweening array
        tweening[tweening.length] = {
            pos: [timelineSelection[0], timelineSelection[1]],
            ease: 'none',
            rate: 1
        }; // Position is an array with start tick and end tick. ease property can be 'none', 'in', 'out', or 'both'. Rate is the "Interpolate 1 frame every (RATE) ticks".

        tweenButton('disable');

        checkSelectionOverlaps(); // Check if the newly added interpolated area will affect the overlapping status (it will), so it will change the message on the interpolation button

    }
});

$('#animate-delete-tweening').click(function() {

    for (var i = 0; i < tweening.length; i++) {

        if (playheadOnSection(tweening[i].pos)) {

            // This code runs for the currently selected interpolated area

            tweening.splice(i, 1);
            i--; // Decrement the counter to prevent skipping items in the array because of the splice

        }

    };

});

// Keyframe buttons

$('#animate-add-keyframe').click(function() {
    addKeyframeAt(animatePlayhead.ontick);
    // Check the 'enable animation' checkbox when the user adds a keyframe
    $('#animate-settings-enable').prop('checked', true).trigger('change');

    updateCCbutton();
});

$('.animate-settings-enable').change(function() {
    if ($(this).is(':checked')) {
        $('#generate-cat-single').css('opacity', '0.5').attr('disabled', true).attr('tooltip', 'You can not use this mode because<br>"Enable Animation" is checked.');
        $('#generate-cat-reusable').click();

        // Show the animations section in the generate dialog box
        $('#generate-settings-reusable-animations').show();
    } else {
        $('#generate-settings-reusable-animations').hide();

        $('#generate-cat-single').css('opacity', '1').attr('disabled', false).removeAttr('tooltip');
    }
    generateOutput();

    var thisChecked = $(this).is(':checked');
    $('.animate-settings-enable').prop('checked', thisChecked);

    updateMultidirectionalContainer()
});

function addKeyframeAt(ontick, isTemp) {
    keyframes[keyframes.length] = {
        objects: [],
        ontick: ontick,
        cc: [],
        scenerot: {
            x: $('#options-rotation-x').val() * (pi / 180),
            y: $('#options-rotation-y').val() * (pi / 180),
            z: $('#options-rotation-z').val() * (pi / 180)
        }
    }

    var rotationalOffsetObj;

    for (var i = 0; i < objects.length; i++) {
        for (var j = 0; j < objects[i].parent.children.length; j++) {
            if (objects[i].parent.children[j].userData.isRotationOffset) {
                rotationalOffsetObj = objects[i].parent.children[j];
            }
        }

        if (objects[i].parent.parent.parent.parent.userData.blankArmorstandPreviewSlot === true)
        {
            continue;
        }

        keyframes[keyframes.length-1].objects[keyframes[keyframes.length-1].objects.length] = {
            uuid: objects[i].uuid,
            position: {
                x: objects[i].parent.parent.parent.parent.position.x,
                y: objects[i].parent.parent.parent.parent.position.y,
                z: objects[i].parent.parent.parent.parent.position.z
            },
            rotation: {
                x: objects[i].parent.rotation.x,
                y: objects[i].parent.parent.rotation.y,
                z: objects[i].parent.parent.parent.rotation.z
            },
            customname: objects[i].userData.customname,
            size: objects[i].parent.scale.y,
            visible: objects[i].userData.visible,
            objref: objects[i]
        }

        if (objects[i].userData.rawid === 'armorstand_neck' && objects[i].parent.parent.parent.parent.parent !== null) {
        	keyframes[keyframes.length-1].objects[keyframes[keyframes.length-1].objects.length-1].position = {
        		x: objects[i].parent.parent.parent.parent.parent.position.x,
        		y: objects[i].parent.parent.parent.parent.parent.position.y,
        		z: objects[i].parent.parent.parent.parent.parent.position.z
        	};
        }

        if (objects[i].userData.rawid === 'armorstand_torso' && objects[i].parent.parent.parent.parent.parent !== null) {

            // The entire rotation of the blank armorstand is stored in the y position coordinate of the torso

            keyframes[keyframes.length-1].objects[keyframes[keyframes.length-1].objects.length-1].position = {
                x: 0,
                y: objects[i].parent.parent.parent.parent.parent.rotation.y,
                z: 0
            };
        }

    }
    updateKeyframeButtons();
}

function deleteKeyframeAt(ontick, updatingKeyframe) {
    var selectedKeyframe = keyframeAt(ontick);
    if (selectedKeyframe !== false) {
        keyframes.splice(selectedKeyframe, 1);
    }

    // Remove the interpolated area that was attached to the keyframe (if there was one)
    // Also, only remove it if this function is actually deleting the keyframe (not if it is just updating it)
    if (!updatingKeyframe) {

        for (var i = 0; i < tweening.length; i++) {
            if (tweening[i].pos.indexOf(ontick) > -1) {
                // There is one attached
                tweening.splice(i, 1); // Remove it
                i--; // This prevents from skipping because of the splice
            }
        }

    }
}

$('#animate-delete-keyframe').click(function() {
    deleteKeyframeAt(animatePlayhead.ontick, false); // Second argument is FALSE because that tells the function that it is actually deleting the keyframe (not updating it)
    loadKeyframeFromPlayhead();
});

function updateKeyframeButtons() {
    // Makes the "Add Keyframe" button disabled if the playhead is already on a tick
    // and makes the "Delete Keyframe" button disabled if it is not on a tick
    $('#animate-add-keyframe').css('opacity', '1').attr('disabled', false).addClass('animate-keyframe-button-enabled');
    $('#animate-delete-keyframe').css('opacity', '1').attr('disabled', false).addClass('animate-keyframe-button-enabled');
    var keyframeFound = false;
    for (var i = 0; i < keyframes.length; i++) {
        if (animatePlayhead.ontick == keyframes[i].ontick) {
            $('#animate-add-keyframe').css('opacity', '0.5').attr('disabled', true).removeClass('animate-keyframe-button-enabled');
            keyframeFound = true;
        }
    }
    if (!keyframeFound || animatePlayhead.ontick == 0) {
        $('#animate-delete-keyframe').css('opacity', '0.5').attr('disabled', true).removeClass('animate-keyframe-button-enabled');
    }
}

// Playhead

animatePlayhead = {
    x: 0,
    move: -1,
    ontick: 0,
    mousedown: false
};

var dragMultiple = [];
var tlStart = -1;
var tlEnd = -1

$('#animate-canvas').mousedown(function() {

    if ($('#customcommands').is(':visible'))
        return;

    dragMultiple = [];

    if (timelineSelection[0] !== timelineSelection[1] && timelineSelection[0] !== -1) {
    	// Hold these in case the user decides to drag multiple keyframes at once
    	if (timelineSelection[0] > timelineSelection[1]) {
    		tlStart = timelineSelection[1];
    		tlEnd = timelineSelection[0];
    	} else {
    		tlStart = timelineSelection[0];
    		tlEnd = timelineSelection[1];
    	}

    	for (var i = 0; i < keyframes.length; i++) {
    		if (keyframes[i].ontick >= tlStart && keyframes[i].ontick <= tlEnd) {
    			// Keyframe is in selection
    			dragMultiple.push(keyframes[i]);
    		}
    	}
    }

    updatePlayhead();
    animatePlayhead.mousedown = true;

    tweenButton('disable');

    //if (holdingShift) {
        // Holding shift, so should select area since mousedown started (IF statement was removed because you don't need to hold shift any more to select areas: just drag)

    timelineSelection = [parseInt(animatePlayhead.ontick), parseInt(animatePlayhead.ontick)]; // Set both the beginning and the end of the selection to the tick under the playhead when first clicked

    // } else {
    //     // Reset the selection when the timeline is clicked but shift is not being held
    //     timelineSelection = [-1, -1];
    // }

    updateCCbutton();

});

function checkSelectionOverlaps() {
    var curItem = {};
    var selectionItem = {};
    var overlaps = false;

    tweening.forEach(function(item) {
        curItem.min = Math.min.apply(Math, item); // Get lowest tick value from the current tweening section
        curItem.max = Math.max.apply(Math, item); // Get highest tick value from the current tweening section

        selectionItem.min = Math.min.apply(Math, timelineSelection); // Get lowest tick value from the current selection
        selectionItem.max = Math.max.apply(Math, timelineSelection); // Get highest tick value from the current selection

        if ( ( curItem.min > selectionItem.min && curItem.min < selectionItem.max ) || ( curItem.max < selectionItem.max && curItem.max > selectionItem.min )  || ( curItem.min <= selectionItem.min && curItem.max >= selectionItem.max )) {
            overlaps = true; // The current selection overlaps one that already exists
        }
    });

    if (overlaps) {
        // Overlaps a preexisting one

        $('#animate-add-tweening').attr('tooltip', 'Your selection cannot overlap a preexisting interpolated area');

    } else {
        // Doesn't overlap a preexisting one

        tweenButton('enable');

    }
}

$('#animate-canvas').mouseup(function() {
    if (timelineSelection[0] !== timelineSelection[1]) {
        // Used to be: If still holding shift when the mouse is released
        // Now, it checks if the selection has grown since the mousedown

        timelineSelection[1] = parseInt(animatePlayhead.ontick); // Set end of selection to the tick that the playhead is on when the mouse is released

        checkSelectionOverlaps();

    } else {

        timelineSelection = [-1, -1];

    }

    if (moveKeyframe !== null && moveKeyframe !== undefined) {
    	// Lock the keyframe to the current location. If there is already a keyframe there, then revert the moved keyframe back to it's original tick

    	var moveKeyframeTo = roundToMultiple(moveKeyframeNewLocation / tickSpacing(), 1);

    	var keyframeAtNewPosition = keyframeAt(moveKeyframeTo);

    	var dragMultipleContainsMain = false; // whether dragMultiple contains the keyframe that was actually dragged
    	for (var i = 0; i < dragMultiple.length; i++) {
    		if (dragMultiple[i].ontick === keyframes[moveKeyframe].ontick) {
    			dragMultipleContainsMain = true;
    		}
    	}

    	if (dragMultiple.length === 0 || !dragMultipleContainsMain) {
    		// Only dragged 1 keyframe

    		if (keyframeAtNewPosition === false || keyframeAtNewPosition === moveKeyframe) {
	    		// No keyframe is already there. Move the keyframe to this tick

	    		var firstTickNeedsKeyframe = false;

	    		if (keyframes[moveKeyframe].ontick === 0)
	    			firstTickNeedsKeyframe = true

	    		keyframes[moveKeyframe].ontick = moveKeyframeTo;
	    		animatePlayhead.ontick = Math.round(moveKeyframeTo);
	    		animatePlayhead.x = moveKeyframeTo * tickSpacing();

	    		// Update tweening
	    		for (var i = tweening.length - 1; i >= 0; i--) {
	    			if (tweening[i].pos[0] === moveKeyframeOriginalTick && tweening[i].pos[0]) {
	    				tweening[i].pos[0] = moveKeyframeTo;
	    			} else if (tweening[i].pos[1] === moveKeyframeOriginalTick) {
	    				tweening[i].pos[1] = moveKeyframeTo;
	    			}
	    		}

	    		if (firstTickNeedsKeyframe) {
	    			var firstKeyframeTick = -1;

	    			// Find the first keyframe that happens in the timeline to duplicate it and place on tick 0
	    			for (var i = 0; i < keyframes.length; i++) {
	    				if (keyframes[i].ontick < firstKeyframeTick || firstKeyframeTick === -1)
	    				{
	    					firstKeyframeTick = keyframes[i].ontick;
	    				}
	    			}

	    		}

	    	} else {
	    		// Already a keyframe there

	    		keyframes[moveKeyframe].ontick = moveKeyframeOriginalTick;

	    	}

    	} else {
    		// Dragged multiple keyframes

    		var canMoveAll = true;
    		var moveDistance = moveKeyframeTo - keyframes[moveKeyframe].ontick;

    		for (var i = 0; i < dragMultiple.length; i++) {

    			if (keyframeAt(dragMultiple[i].ontick + moveDistance)) {
    				canMoveAll = false;
    			}

    		}

    		if (canMoveAll) {
	    		// No keyframe is already in a location that has an "incoming keyframe"

	    		for (var i = 0; i < dragMultiple.length; i++) {

	    			// Update tweening
		    		for (var j = tweening.length - 1; j >= 0; j--) {
		    			if (tweening[j].pos[0] === dragMultiple[i].ontick && tweening[j].pos[0]) {
		    				tweening[j].pos[0] = dragMultiple[i].ontick + moveDistance;
		    			} else if (tweening[j].pos[1] === dragMultiple[i].ontick) {
		    				tweening[j].pos[1] = dragMultiple[i].ontick + moveDistance;
		    			}
		    		}

	    			dragMultiple[i].ontick += moveDistance;

	    		}

	    		// Highlight the moved keyframes again
	    		timelineSelection[0] = tlStart + moveDistance;
	    		timelineSelection[1] = tlEnd + moveDistance;

	    	} else {
	    		// Already a keyframe blocking one

	    		keyframes[moveKeyframe].ontick = moveKeyframeOriginalTick;

	    	}

    	}

    	moveKeyframe = null;
    	moveKeyframeOriginalTick = null;
    	moveKeyframeNewLocation = null

    }

    animatePlayhead.mousedown = false;
});

function updatePlayhead() {
    // Move the playhead to wherever the user clicks
    if (moveKeyframe === null) {

    	animatePlayhead.x = roundToMultiple(mousePos.x, tickSpacing());
	    animatePlayhead.ontick = Math.round(animatePlayhead.x / tickSpacing());
	    // animatePlayhead.ontick will be the tick which the playhead is currently on (starting with the first tick as 0).

	    // Update the end of the selection so that it adjusts smoothly as the playhead moves

	    timelineSelection[1] = parseInt(animatePlayhead.ontick);

    }

    updateKeyframeButtons();

    loadKeyframeFromPlayhead();

    updateCustomCommandsList();

    if (timelineSelection[0] !== -1 && timelineSelection[0] !== timelineSelection[1]) {
        $('#animate-selected-tick').html(parseInt(timelineSelection[0]) + '-' + parseInt(timelineSelection[1]));
    } else {
        $('#animate-selected-tick').html(parseInt(timelineSelection[1]));
    }
    
}

function loadKeyframeFromPlayhead(dontRender) {
    // Load the object positions from the new selected keyframe (if the playhead is on one)
    if (keyframeAt(animatePlayhead.ontick) !== false) {
        loadFromKeyframe(keyframeAt(animatePlayhead.ontick));
        if (dontRender === undefined)
            render();
    } else {
        var foundLastKeyframe = false;
        var findLastIndex = animatePlayhead.ontick;
        while (!foundLastKeyframe) {
            findLastIndex -= 1;
            if (keyframeAt(findLastIndex) !== false) {
                foundLastKeyframe = true;
                loadFromKeyframe(keyframeAt(findLastIndex));
                if (dontRender === undefined)
                    render();
            }
            if (findLastIndex < 0) {
                foundLastKeyframe = true;
                // Prevents it from getting stuck
                // in an infinite loop (even though it never should)
            }
        }
    }
}

// Canvas setup

animateCanvas = document.getElementById('animate-canvas');
animateCtx = animateCanvas.getContext('2d');
animateCanvas.width = Math.round($('#animate').width()) - 4;
animateCanvas.height = 64;

function tickSpacing() {
    return ((animateCanvas.width - 3) / (settings.animate.ticks - 1));
}

// Keyframes

keyframes = [];
invisibleKeyframes = [];
keyframeSize = 8;

function keyframeAt(ontick) {
    // If a keyframe is selected, this function will return its index in the 'keyframes' array.
    // If no keyframe is selected, it will return 'false'.
    for (var i = 0; i < keyframes.length; i++) {
        if (parseInt(keyframes[i].ontick) == parseInt(ontick)) {
            return i;
        }
    }
    return false;
}

function keyframeUsedAt(ontick) {
    // Same as the keyframeAt() function above, except this one never returns 'false'.
    //Instead, it will just look for the previous one until it finds the keyframe that would be active on this tick

    sortKeyframes();

    for (var i = keyframes.length - 1; i >= 0; i--) {

        if (keyframes[i].ontick <= ontick) {

            return i;

        }

    }

}

function loadFromKeyframe(keyframeindex) {
    var selectedKeyframe = keyframeindex;
    for (var i = 0; i < keyframes[selectedKeyframe].objects.length; i++) {
        for (var j = 0; j < objects.length; j++) {
            if (keyframes[selectedKeyframe].objects[i].uuid === objects[j].uuid) {
                // Give the position and rotation from keyframes[selectedKeyframe].objects[i] to objects[j]

                if (objects[j].userData.rawid === 'armorstand_neck') {
                	// Set the position of the entire parent blank armorstand
                	objects[j].parent.parent.parent.parent.parent.position.set(keyframes[selectedKeyframe].objects[i].position.x, keyframes[selectedKeyframe].objects[i].position.y, keyframes[selectedKeyframe].objects[i].position.z);
                } else if (objects[j].userData.rawid === 'armorstand_torso') {
                    $('#selectedobj-armorstand-bodyrotation').val(keyframes[selectedKeyframe].objects[i].position.y / (Math.PI / 180));
                    objects[j].parent.parent.parent.parent.parent.rotation.set(0, keyframes[selectedKeyframe].objects[i].position.y, 0);
                } else {
                	objects[j].parent.parent.parent.parent.position.set(keyframes[selectedKeyframe].objects[i].position.x, keyframes[selectedKeyframe].objects[i].position.y, keyframes[selectedKeyframe].objects[i].position.z);
                }

                updateObjectMoverLines();
                objects[j].parent.rotation.x = keyframes[selectedKeyframe].objects[i].rotation.x;
                objects[j].parent.parent.rotation.y = keyframes[selectedKeyframe].objects[i].rotation.y;
                objects[j].parent.parent.parent.rotation.z = keyframes[selectedKeyframe].objects[i].rotation.z;

                objects[j].userData.visible = keyframes[selectedKeyframe].objects[i].visible;
                updateObjectVisibility(objects[j]);
            }
        }
    }

    // Set rotation of scene wrapper then update the text fields to match
    if (keyframes[selectedKeyframe].scenerot === undefined){

        keyframes[selectedKeyframe].scenerot = {x: 0, y: 0, z: 0};

    }

    sceneWrapper.rotation.set(keyframes[selectedKeyframe].scenerot.x, keyframes[selectedKeyframe].scenerot.y, keyframes[selectedKeyframe].scenerot.z);

    $('#options-rotation-x').val(keyframes[selectedKeyframe].scenerot.x / (pi / 180));
    $('#options-rotation-y').val(keyframes[selectedKeyframe].scenerot.y / (pi / 180));
    $('#options-rotation-z').val(keyframes[selectedKeyframe].scenerot.z / (pi / 180));

    editObject(selectedObject());
}

$('.animate-changes').change(function() {

    // Will need to have an if statement which makes it use the old method (updateKeyframeAt(animatePlayhead.ontick) once the multiple-object moving feature is added)
    // (but still use this more efficient method below if only 1 object is currently selected.)
    // UPDATE: instead of using the old method, loop through all of the currently selected objects (not what was written above)

    var curObj = selectedObject();
    updateObjectAt({
        uuid: curObj.uuid,
        objref: curObj,
        ontick: animatePlayhead.ontick
    });

    if (animatePlayhead.ontick > 0) {
        // If not on the first keyframe which is required, and the user moved an object, which would create a new keyframe
        $('#animate-settings-enable').prop('checked', true).trigger('change');
    }
});

$('.animate-changes').keydown(function() {
    controls.enabled = false;
});

$('.animate-changes-force').change(function() {
    // Forces the entire keyframe to be updated when an element with this class is changed

    if (animatePlayhead.ontick > 0) {
        // If not on the first keyframe which is required, and the user moved an object, which would create a new keyframe
        $('#animate-settings-enable').prop('checked', true).trigger('change');
    }

    updateKeyframeAt(animatePlayhead.ontick);
});

function getObjectByUUID(uuid) {
    // Get an object reference by its UUID

    for (var i = 0; i < objects.length; i++) {

        if (objects[i].uuid === uuid) {

            return objects[i];

        }

    }
}

function updateKeyframeAt(ontick) {

	var saveCC = [];

	if (keyframeAt(ontick) !== false)
		saveCC = keyframes[keyframeAt(ontick)].cc.slice();

    deleteKeyframeAt(ontick, true); // Second argument is set to TRUE to tell the function that it is updating the keyframe, not just deleting it
    addKeyframeAt(ontick);

    keyframes[keyframeAt(ontick)].cc = saveCC;
}
updateKeyframeAt(animatePlayhead.ontick);

function updateObjectAt(args) {
    // Updates the values of a specific object at a specific keyframe based on whatever the object's values currently are in the scene

    var uuid = args.uuid;
    var ontick = args.ontick;
    var objectref = args.objref;

    // If the object reference wasn't defined, find it manually here
    if (objectref === undefined) {

        for (var i = 0; i < objects.length; i++) {

            if (objects[i].uuid === args.uuid) {

                objectref = objects[i];

            }

        }

    }

    // Find the specific keyframe specified
    for (var i = 0; i < keyframes.length; i++) {

        if (keyframes[i].ontick === ontick) {

            // Find the specific object specified within that keyframe
            for (var j = 0; j < keyframes[i].objects.length; j++) {

                if (keyframes[i].objects[j].uuid === uuid) {

                    keyframes[i].objects[j] = {
                        uuid: uuid,
                        position: {
                            x: objectref.parent.parent.parent.parent.position.x,
                            y: objectref.parent.parent.parent.parent.position.y,
                            z: objectref.parent.parent.parent.parent.position.z
                        },
                        rotation: {
                            x: objectref.parent.rotation.x,
                            y: objectref.parent.parent.rotation.y,
                            z: objectref.parent.parent.parent.rotation.z
                        },
                        customname: objectref.userData.customname,
                        size: objectref.parent.scale.y,
                        visible: objectref.userData.visible,
                        objref: objectref
                    };

                    if (objectref.userData.rawid.indexOf('armorstand_') > -1 && objectref.parent.parent.parent.parent.parent !== null) {

                    	var armorstandNeckObj = objectref.parent.parent.parent.parent.parent.children[0].children[0].children[0].children[0].children[0];

                    	for (var k = 0; k < keyframes[i].objects.length; k++) {

                    		// Change the position of the neck object when any part is selected and the blank armorstand's position is changed by the user

                    		if (keyframes[i].objects[k].uuid === armorstandNeckObj.uuid) {

                    			keyframes[i].objects[k].position = {
					        		x: objectref.parent.parent.parent.parent.parent.position.x,
					        		y: objectref.parent.parent.parent.parent.parent.position.y,
					        		z: objectref.parent.parent.parent.parent.parent.position.z
					        	};

					        	break;

                    		}

                    	}
			        }

                    if (objectref.userData.rawid === 'armorstand_torso' && objectref.parent.parent.parent.parent.parent !== null) {

                        // The entire rotation of the blank armorstand is stored in the y position coordinate of the torso

                        keyframes[i].objects[j].position = {
                            x: 0,
                            y: objectref.parent.parent.parent.parent.parent.rotation.y,
                            z: 0
                        };
                    }

                    return true;

                }

            }

        }

    }

    // The keyframe was most likely not found
    updateKeyframeAt(ontick);

}

function removeObjFromKeyframes(uuid) {
    for (var i = 0; i < keyframes.length; i++) {
        for (var j = 0; j < keyframes[i].objects.length; j++) {
            if (keyframes[i].objects[j].uuid == uuid) {
                keyframes[i].objects.splice(j, 1);
            }
        }
    }
}

// Mouse movement and tracking

function getMousePos(targetcanvas, evt) {
    var rect = targetcanvas.getBoundingClientRect();
    return {
        x: Math.round((evt.clientX-rect.left)/(rect.right-rect.left)*targetcanvas.width),
        y: Math.round((evt.clientY-rect.top)/(rect.bottom-rect.top)*targetcanvas.height)
    };
}

var moveKeyframe = null;
var moveKeyframeNewLocation = null;
var moveKeyframeOriginalTick = null;

var mousePos;
animateCanvas.addEventListener('mousemove', function(evt) {

    mousePos = getMousePos(animateCanvas, evt);
    animatePlayhead.move = roundToMultiple(mousePos.x, tickSpacing());

    if (animatePlayhead.mousedown) {
        updatePlayhead();

        if (moveKeyframe !== null) {
        	moveKeyframeNewLocation = mousePos.x;
        }
    }

	// Show pointer cursor if the mouse if hovering over a yellow keyframe diamond

    $('#animate-canvas').css('cursor', 'default');

    // If the mouse is vertically in the location of the keyframe objects
    if (mousePos.y > (animateCanvas.clientHeight / 2) - keyframeSize && mousePos.y < (animateCanvas.clientHeight / 2) + keyframeSize) {

    	// Check if there is actually a keyframe at the mouse position and then check if the mouse is horizontally hovering over the keyframe
    	if (keyframeAt(Math.round(animatePlayhead.move / tickSpacing())) !== false && mousePos.x > animatePlayhead.move - keyframeSize && mousePos.x < animatePlayhead.move + keyframeSize) {
    		
    		$('#animate-canvas').css('cursor', 'pointer');

    		if (animatePlayhead.mousedown && moveKeyframe === null && timelineSelection[0] === timelineSelection[1]) { // && animatePlayhead.ontick !== 0
    			moveKeyframeOriginalTick = Math.round(animatePlayhead.move / tickSpacing());
    			moveKeyframe = keyframeAt(Math.round(animatePlayhead.move / tickSpacing()));
    		}

    	}

    }


}, false);

$('#animate-canvas').mouseleave(function() {
    animatePlayhead.move = -1;
});

function playheadOnSection(section) {
    var secMin = Math.min.apply(Math, section);
    var secMax = Math.max.apply(Math, section);

    var selecMin = Math.min.apply(Math, timelineSelection);
    var selecMax = Math.max.apply(Math, timelineSelection);

    var onSection = false;

    if (timelineSelection[0] !== timelineSelection[1]) {
        // Check if selection is on the section

        if ((selecMin > secMin && selecMin < secMax) || (selecMax > secMin && selecMax < secMax) || (selecMin <= secMin && selecMax >= secMax)) {
            onSection = true;
        }
    } else {
        // Check if playhead is on the section

        if (animatePlayhead.ontick >= secMin && animatePlayhead.ontick < secMax) {
            onSection = true;
        }
    }

    if (onSection) {
        deleteTweenButton('enable');

        return true;
    } else {
        return false;
    }
}

// Rendering/update function

function updateAnimationCanvas() {
    animateCtx.clearRect(0, 0, animateCanvas.width, animateCanvas.height);

    var tickspace = tickSpacing();

    // Draw time marker ticks
    animateCtx.fillStyle = '#000000';
    for (var i = 0; i < settings.animate.ticks; i++) {
        animateCtx.fillRect(tickspace * i, 0, 1, 8);
    }

    // Draw the interpolation/tweening lines under the keyframes
    var tweenLineWidth = 4;

    deleteTweenButton('disable'); // Disable the tween button first, so that it will be enabled if 1 or more sections are selected

    for (var i = 0; i < tweening.length; i++) {
        
        if (playheadOnSection(tweening[i].pos)) {
            // Selection or playhead is on the current section
            animateCtx.fillStyle = '#ffe680';
            animateCtx.strokeStyle = '#ff4d4d';
            animateCtx.lineWidth = 2;

        } else {
            // Regular (not selected)
            animateCtx.fillStyle = '#e6b800';
            animateCtx.strokeStyle = '#b38f00';
            animateCtx.lineWidth = 1;
        }
        animateCtx.beginPath();
        animateCtx.moveTo(tweening[i].pos[0] * tickspace, Math.floor(animateCanvas.height / 2) - tweenLineWidth / 2);
        animateCtx.lineTo(tweening[i].pos[0] * tickspace, Math.floor(animateCanvas.height / 2) + tweenLineWidth / 2);
        animateCtx.lineTo(tweening[i].pos[1] * tickspace, Math.floor(animateCanvas.height / 2) + tweenLineWidth / 2);
        animateCtx.lineTo(tweening[i].pos[1] * tickspace, Math.floor(animateCanvas.height / 2) - tweenLineWidth / 2);
        animateCtx.closePath();
        animateCtx.fill();
        animateCtx.stroke();
    }

    // Draw selection line
    animateCtx.lineWidth = 10;
    animateCtx.strokeStyle = 'rgba(255, 102, 102, 0.5)';

    if (timelineSelection[0] !== -1) {
        animateCtx.beginPath();
        animateCtx.moveTo(timelineSelection[0] * tickspace, Math.floor(animateCanvas.height / 2));
        animateCtx.lineTo(timelineSelection[1] * tickspace, Math.floor(animateCanvas.height / 2));
        animateCtx.stroke();
    }

    // Draw keyframes
    animateCtx.strokeStyle = '#1a1a1a';
    animateCtx.lineWidth = 2;

    var currentX = 0;
    for (var i = 0; i < keyframes.length; i++) {

        if (animatePlayhead.ontick == keyframes[i].ontick) {
            animateCtx.fillStyle = '#cca300';
        } else {
            animateCtx.fillStyle = '#ffcc00';
        }

        if (moveKeyframe === null || moveKeyframe !== i) {
        	currentX = keyframes[i].ontick * tickspace;
        } else {
        	// User is moving a keyframe, so it shouldn't be locked to the ticks
        	currentX = moveKeyframeNewLocation;
        }
        
        animateCtx.beginPath();
        animateCtx.moveTo(currentX, Math.floor(animateCanvas.height / 2) - keyframeSize);
        animateCtx.lineTo(currentX + keyframeSize, Math.floor(animateCanvas.height / 2));
        animateCtx.lineTo(currentX, Math.floor(animateCanvas.height / 2) + keyframeSize);
        animateCtx.lineTo(currentX - keyframeSize, Math.floor(animateCanvas.height / 2));
        animateCtx.closePath();
        animateCtx.fill();
        animateCtx.stroke();
    }

    // Draw the playhead
    animateCtx.fillStyle = '#e60000'; // (red)
    animateCtx.fillRect(animatePlayhead.x, 0, 1, animateCanvas.height);

    // Draw the lighter "moving" playhead
    animateCtx.fillStyle = '#ff6666'; // (red)
    animateCtx.fillRect(animatePlayhead.move, 0, 1, animateCanvas.height);

    if (animatePlayhead.move !== -1) {

        animateCtx.fillStyle = '#4a4a4a';
        animateCtx.font = "16px Open Sans";
        animateCtx.fillText(Math.round(animatePlayhead.move / tickSpacing()), mousePos.x + 18, mousePos.y + 25);

    }
    
    // animateCtx.fillStyle="#000000";
    // animateCtx.fillRect(0, 0, 20, 20);
    
    // animateCtx.font = '16px Arial';
    // animateCtx.fillText('Text', 30,20);
    
    window.requestAnimationFrame(updateAnimationCanvas);
}

window.requestAnimationFrame(updateAnimationCanvas);

function fixKeyframePositions() {
    // Rounds off keyframe and tweening positions
    for (var i = 0; i < keyframes.length; i++) {
        keyframes[i].ontick = parseInt(keyframes[i].ontick);
    }

    for (var i = 0; i < tweening.length; i++) {
        tweening[i].pos[0] = parseInt(tweening[i].pos[0]);
        tweening[i].pos[1] = parseInt(tweening[i].pos[1]);
    }
}

function removeDuplicateKeyframes() {
    // Looks for duplicates in the keyframes[] array and removes all occurences except for the first

    for (var i = keyframes.length-1; i > 0; i--) {

        for (var j = keyframes.length-1; j > 0; j--) {

            if (keyframes[i].ontick === keyframes[j].ontick && j !== i) {

                // Found a duplicate of keyframes[i] (the duplicate to be removed is keyframes[j])

                keyframes.splice(j, 1);
                i--;
                j--;

            }

        }

    }

}

// Get the position of an object at a certain keyframe
function getPosAtKeyframe(objectuuid, keyframetick) {
    for (var i = 0; i < keyframes.length; i++) {
        if (keyframes[i].ontick == keyframetick) {
            for (var j = 0; j < keyframes[i].objects.length; j++) {
                if (keyframes[i].objects[j].uuid === objectuuid) {
                    return {
                        x: keyframes[i].objects[j].position.x,
                        y: keyframes[i].objects[j].position.y,
                        z: keyframes[i].objects[j].position.z
                    };
                }
            }
        }
    }
}

// Get the position of an object at a certain keyframe
function getRotAtKeyframe(objectuuid, keyframetick) {
    for (var i = 0; i < keyframes.length; i++) {
        if (keyframes[i].ontick == keyframetick) {
            for (var j = 0; j < keyframes[i].objects.length; j++) {
                if (keyframes[i].objects[j].uuid === objectuuid) {
                    return {
                        x: keyframes[i].objects[j].rotation.x,
                        y: keyframes[i].objects[j].rotation.y,
                        z: keyframes[i].objects[j].rotation.z
                    };
                }
            }
        }
    }
}

function findPreviousKeyframe(curOntick) {
    // Find the previous keyframe (by tick) from the ontick value specified in the argument

    var highestValue = -1;
    var prevIndex = -1;

    for (var i = 0; i < keyframes.length; i++) {

        if (keyframes[i].ontick < curOntick && keyframes[i].ontick > highestValue) {

            highestValue = keyframes[i].ontick;
            prevIndex = i;

        }

    }

    return {
        ontick: highestValue,
        index: prevIndex
    }; // Returns the keyframe index

}

function findNexKeyframe(curOntick) {
    // Find the previous keyframe (by tick) from the ontick value specified in the argument

    var lowestValue = 99999;
    var nextIndex = -1;

    for (var i = 0; i < keyframes.length; i++) {

        if (keyframes[i].ontick > curOntick && keyframes[i].ontick < lowestValue) {

            lowestValue = keyframes[i].ontick;
            nextIndex = i;

        }

    }

    return {
        ontick: lowestValue,
        index: nextIndex
    }; // Returns the keyframe index

}

$('#animate-settings-loop').change(function() {
    // updateManipulateButton();

    if ($(this).is(':checked')) {
        $('#animate-settings-play-once-container').slideUp(100);
    } else {
        $('#animate-settings-play-once-container').slideDown(150);
    }

});

function generateInterpolatedFrames() {

    fixKeyframePositions();

    // Before anything else is done, set up tweening. To create the interpolated frames, it will generate temporary keyframes, flagged with the property '.temp = true'
    // Before this function returns its value, it will loop through all keyframes and delete any temporary ones which were used for interpolated frames

    var counter; // Used when looping through the ticks between the start and end position of each interpolated area

    var tweenTicksLength; // Amount of ticks in the middle of the interpolated area

    for (var i = 0; i < tweening.length; i++) {

        // No need to actually load the keyframes to the scene here. Instead, use the positions and rotations from the beginning and end keyframes which already exist!

        counter = 0;

        tweenTicksLength = tweening[i].pos[1] - tweening[i].pos[0]; // Makes tweenTicksLength the amount of ticks between the start and end of the interpolated area

        for (var j = tweening[i].pos[0] + 1; j < tweening[i].pos[1]; j += tweening[i].rate) {

            counter = counter + tweening[i].rate; // Increment the counter at the beginning so that the first interpolated frame is not an exact copy of the interpolated area's start position

            keyframes[keyframes.length] = {
                objects: [],
                ontick: j,
                cc: [],
                temp: true,
                scenerot: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            }; // Add a new keyframe with the basic template of a keyframe (copy the beginning of the interpolated area for this)

            // Interpolation for scene wrapper rotation
            var easingFn
            switch (tweening[i].ease) {
                case 'none':
                    easingFn = 'linearTween'; break;
                case 'in':
                    easingFn = 'easeInSine'; break;
                case 'out':
                    easingFn = 'easeOutSine'; break;
                case 'both':
                    easingFn = 'easeInOutSine'; break;
                default:
                    alert('Error while generating easing'); break;
            }

            var beginKeyframe = keyframes[keyframeAt(tweening[i].pos[0])];
            var endKeyframe = keyframes[keyframeAt(tweening[i].pos[1])];

            if (keyframes[keyframes.length-1].scenerot === undefined) {
                keyframes[keyframes.length-1].scenerot = {x: 0, y: 0, z: 0};
            }

            if (beginKeyframe.scenerot === undefined) {
                beginKeyframe.scenerot = {x: 0, y: 0, z: 0};
            }

            if (endKeyframe.scenerot === undefined) {
                endKeyframe.scenerot = {x: 0, y: 0, z: 0};
            }

            keyframes[keyframes.length-1].scenerot.x = window[easingFn](counter, beginKeyframe.scenerot.x, endKeyframe.scenerot.x, tweenTicksLength);
            keyframes[keyframes.length-1].scenerot.y = window[easingFn](counter, beginKeyframe.scenerot.y, endKeyframe.scenerot.y, tweenTicksLength);
            keyframes[keyframes.length-1].scenerot.z = window[easingFn](counter, beginKeyframe.scenerot.z, endKeyframe.scenerot.z, tweenTicksLength);

            for (var k = 0; k < keyframes[keyframeAt(tweening[i].pos[0])].objects.length; k++) {

                // Copy each object from the keyframe "template" to the new interpolated keyframe

                var keyframeTemplateObj = keyframes[keyframeAt(tweening[i].pos[0])].objects[k];

                keyframes[keyframes.length-1].objects[keyframes[keyframes.length-1].objects.length] = {
                    uuid: keyframeTemplateObj.uuid,
                    position: {
                        x: keyframeTemplateObj.position.x,
                        y: keyframeTemplateObj.position.y,
                        z: keyframeTemplateObj.position.z
                    },
                    rotation: {
                        x: keyframeTemplateObj.rotation.x,
                        y: keyframeTemplateObj.rotation.y,
                        z: keyframeTemplateObj.rotation.z
                    },
                    customname: keyframeTemplateObj.customname,
                    size: keyframeTemplateObj.size,
                    visible: keyframeTemplateObj.visible,
                    objref: keyframeTemplateObj.objref
                } // Gets all of the values straight from the 'template'

            }

            var beginObjectPos, endObjectPos, beginObjectRot, endObjectRot;

            for (var k = 0; k < keyframes[keyframes.length-1].objects.length; k++) {

                beginObjectPos = keyframes[keyframeAt(tweening[i].pos[0])].objects[k].position;
                endObjectPos = keyframes[keyframeAt(tweening[i].pos[1])].objects[k].position;

                beginObjectRot = keyframes[keyframeAt(tweening[i].pos[0])].objects[k].rotation;
                endObjectRot = keyframes[keyframeAt(tweening[i].pos[1])].objects[k].rotation;

                var easingFunctionName = '';

                switch (tweening[i].ease) {
                    case 'none':
                        easingFunctionName = 'linearTween'; break;
                    case 'in':
                        easingFunctionName = 'easeInSine'; break;
                    case 'out':
                        easingFunctionName = 'easeOutSine'; break;
                    case 'both':
                        easingFunctionName = 'easeInOutSine'; break;
                    default:
                        alert('Error while generating easing'); break;
                }

                // Now use the function names above and turn them into an actual function that will be used below

                keyframes[keyframes.length-1].objects[k].position.x = window[easingFunctionName](counter, beginObjectPos.x, endObjectPos.x - beginObjectPos.x, tweenTicksLength);
                keyframes[keyframes.length-1].objects[k].position.y = window[easingFunctionName](counter, beginObjectPos.y, endObjectPos.y - beginObjectPos.y, tweenTicksLength);
                keyframes[keyframes.length-1].objects[k].position.z = window[easingFunctionName](counter, beginObjectPos.z, endObjectPos.z - beginObjectPos.z, tweenTicksLength);

                keyframes[keyframes.length-1].objects[k].rotation.x = window[easingFunctionName](counter, beginObjectRot.x, endObjectRot.x - beginObjectRot.x, tweenTicksLength);
                keyframes[keyframes.length-1].objects[k].rotation.y = window[easingFunctionName](counter, beginObjectRot.y, endObjectRot.y - beginObjectRot.y, tweenTicksLength);
                keyframes[keyframes.length-1].objects[k].rotation.z = window[easingFunctionName](counter, beginObjectRot.z, endObjectRot.z - beginObjectRot.z, tweenTicksLength);

            }

        }

    }

    fixKeyframePositions();

}

function removeTempFrames() {

    // Remove temporary keyframes

    for (var i = 0; i < keyframes.length; i++) {

        if (keyframes[i].temp) {

            keyframes.splice(i, 1);

            i--;

        }

    }

}

function sortKeyframes() {
    // Orders the keyframes[] array by their 'ontick' property

    keyframes.sort(function(a, b) {
        if (a.ontick < b.ontick) {
               return -1;
         } else if (a.ontick > b.ontick)  {
               return 1; 
         } else {
               return 0;
          }
    });

}

function removeDuplicates() {

    var alreadyIncluded = ',';

    for (var i = 0; i < keyframes.length; i++) {

        if (alreadyIncluded.indexOf(',' + keyframes[i].ontick + ',') > -1) {

            keyframes.splice(i, 1);
            i--;

        } else {

            alreadyIncluded += keyframes[i].ontick + ',';

        }

    }

}

// Linear movement function
linearTween = function (t, b, c, d) {
    return c*t/d + b;
};

// Ease in function
easeInSine = function (t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
};

// Ease out function
easeOutSine = function (t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
};

// Ease both function
easeInOutSine = function (t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
};

// Generating the commands for an animation

function generateAnimationCommands(returnList, currentDirIndex) {

    fixKeyframePositions();

    for (var i = 0; i < blankArmorstands; i++) {

        delete blankArmorstands[i].userData.armSwayInitOffsetLeft;
        delete blankArmorstands[i].userData.armSwayInitOffsetRight;

    }

    // returnList is only specified when the user is in the export dialog box and is trying to load a custom list
    // returnList will be false and currentDirIndex will be an integer when the user is loading multiple directional placement
    // Even when they are not doing multi-directional placement, it will probably still run currentDirIndex at 0 once in order to generate the regular, single-direction commands

    if (currentDirIndex === undefined) {
        currentDirIndex = 0;
    }

    // Will return an array of the commands that must be added in order to run the animation
    var commands = [];

    // keyframes[] is an array which holds an object for each keyframe.
    // Each keyframe object is like so:
    // {objects: [{position:{x:1,y:2,z:3},rotation:{x:4,y:5,z:6},uuid:"specialeyes"},{more},{etc}]}

    settings.animate.loop = $('#animate-settings-loop').is(':checked');

    // Entity attaching
    var attachEntity = $('#generate-settings-reusable-attach').val();

    if (attachEntity.length > 0) {
        // An entity to attach to was specified

        commands[commands.length] = 'tp @e[type=armor_stand,name=' + settings.uniquestring + '_M,tag=AM_TP] ' + attachEntity;

    }


    // In each object of each keyframe, set the movechange{x, y, z} to the amount that object has moved since the previous keyframe
    // The '.movechange' property doesn't need to be given to each keyframe before this because this is the only place that it will be used
    // The '.moved' property is a boolean which is dependent on whether the object moved since the last keyframe or not
    // The '.prev' property is a number which is the index of the previous keyframe (the last keyframe if the current object is the first one)

    var tempPosCur = {};
    var tempPosPrev = {};
    var tempOffsetHolder1 = {};
    var tempOffsetHolder2 = {};

    // Get the rotation offset for each keyframe and give it to the .rotoffset property of each object in each keyframe

    // First, save a copy of the current position of the playhead so that it can be reverted afterwards

    var previousSelectedTick = animatePlayhead.ontick;

    generateInterpolatedFrames();

    removeDuplicates();
    sortKeyframes(); // Sort keyframes by their 'ontick' properties, so that all keyframes are in order in the array

    // Remove ghost objects in keyframes
    for (var i = 0; i < keyframes.length; i++) {
        for (var j = 0; j < keyframes[i].objects.length; j++) {
            if (keyframes[i].objects[j].objref === undefined) {
                keyframes[i].objects.splice(j, 1);
                j--;
            }
        }
    }

    // This next loop will requre changing the selected tick, so don't revert the playhead to its original location yet
    // This is where it gets the locations of every object in every keyframe

    var isDeadEndObj; // if object exists in a keyframe but not in objects[] array (flag which means that it should be removed from the keyframe)

    for (var i = 0; i < keyframes.length; i++) {
        
        // Now, move the playhead to the needed keyframe then load the objects from it

        animatePlayhead.ontick = keyframes[i].ontick;
        loadKeyframeFromPlayhead();

        for (var j = 0; j < keyframes[i].objects.length; j++) {

            var rotationOffsetObj;

            isDeadEndObj = true; // dead end until proven not

            for (var k = 0; k < objects.length; k++) {

                if (keyframes[i].objects[j].uuid === objects[k].uuid) {

                    isDeadEndObj = false;

                    // Get the absolute position of the objects rotationoffset

                    keyframes[i].objects[j].inGameY = objects[k].userData.armorStandRef.rawY;

                    if (objects[k].userData.rawid.indexOf('armorstand_') > -1) {
                    	// Is a blank armorstand

	                	keyframes[i].objects[j].inGameY = objects[k].userData.armorStandRef.rawY;


	                	keyframes[i].objects[j].rotoffset = {
	                		x: 0,
	                		y: 0,
	                		z: 0
	                	};
                    } else {

                    	// Regular object

                    	for (var l = 0; l < objects[k].parent.children.length; l++) {

	                        if (objects[k].parent.children[l].userData.isRotationOffset) {

	                            // keyframes[i].objects[j].rotoffset = rotationOffsetObj;

	                            keyframes[i].objects[j].rotoffset = getRotOffset({
	                                x: keyframes[i].objects[j].position.x,
	                                y: keyframes[i].objects[j].position.y,
	                                z: keyframes[i].objects[j].position.z,
	                                size: keyframes[i].objects[j].size
	                            }, objects[k].parent.children[l]); // Now, instead of the line which is commented out above, the .rotoffset property of objects in keyframes will
	                            // store the vector of the rotational offset objects absolute position, relative to the world

	                        }
	                    }

                    }

                    break;

                }

            }

            if (isDeadEndObj) {

                keyframes[i].objects.splice(j, 1); // remove dead end object from keyframe
                j--;

            }

        }

    }

    // When it's done, move the playhead back to its original tick, and load the keyframe from it

    animatePlayhead.ontick = previousSelectedTick;
    loadKeyframeFromPlayhead();

    for (var i = 0; i < keyframes.length; i++) {

        for (var j = 0; j < keyframes[i].objects.length; j++) {

            // Position changes below here

            // Get the index of the previous keyframe (the last keyframe if the current one is the first)

            if (i === 0) {

                keyframes[i].prev = keyframes.length-1;

            } else {

                keyframes[i].prev = i - 1;

            }

            if (keyframes[keyframes[i].prev].objects[j] === undefined) {
                debugger;

                keyframes[keyframes[i].prev].objects[j] = keyframes[i].objects[j];
            }

            // Now, use the index of the previous keyframe in order to find the position change amount (while accounting for the rotational offset)

            // Get rotational offset w/ position of current keyframe
            tempOffsetHolder1 = keyframes[i].objects[j].rotoffset;
            tempOffsetHolder2 = keyframes[i].objects[j].position;

            tempPosCur = {
                x: tempOffsetHolder1.x + tempOffsetHolder2.x,
                y: tempOffsetHolder1.y + tempOffsetHolder2.y,
                z: tempOffsetHolder1.z + tempOffsetHolder2.z
            }

            // Get rotational offset w/ position of previous keyframe (which would be the very last keyframe in this case, because of the "if (i === 0)" above)

            tempOffsetHolder1 = keyframes[keyframes[i].prev].objects[j].rotoffset;
            tempOffsetHolder2 = keyframes[keyframes[i].prev].objects[j].position;

            tempPosPrev = {
                x: tempOffsetHolder1.x + tempOffsetHolder2.x,
                y: tempOffsetHolder1.y + tempOffsetHolder2.y,
                z: tempOffsetHolder1.z + tempOffsetHolder2.z
            }


            keyframes[i].objects[j].movechange = {
                x: tempPosCur.x - tempPosPrev.x,
                y: tempPosCur.y - tempPosPrev.y,
                z: tempPosCur.z - tempPosPrev.z
            }


            if ((keyframes[i].objects[j].movechange.x === 0 && keyframes[i].objects[j].movechange.y === 0 && keyframes[i].objects[j].movechange.z === 0) && keyframes[i].ontick !== 0) { // Originally had this: " || (j === 0 && keyframes[i].objects.length > 1)" at the end of the if statement (for some reason unknown)

                keyframes[i].objects[j].moved = false; // Keeps track of whether or not the object moved since the previous keyframe

            } else {

                keyframes[i].objects[j].moved = true;

            }

            // Rotation changes below here

            if (i === 0) {

                keyframes[i].objects[j].rotchange = {
                    x: keyframes[i].objects[j].rotation.x - keyframes[keyframes.length - 1].objects[j].rotation.x,
                    y: keyframes[i].objects[j].rotation.y - keyframes[keyframes.length - 1].objects[j].rotation.y,
                    z: keyframes[i].objects[j].rotation.z - keyframes[keyframes.length - 1].objects[j].rotation.z
                }

                keyframes[i].prev = keyframes.length-1;

            } else {

                keyframes[i].objects[j].rotchange = {
                    x: keyframes[i].objects[j].rotation.x - keyframes[i - 1].objects[j].rotation.x,
                    y: keyframes[i].objects[j].rotation.y - keyframes[i - 1].objects[j].rotation.y,
                    z: keyframes[i].objects[j].rotation.z - keyframes[i - 1].objects[j].rotation.z
                }

                keyframes[i].prev = i - 1;

            }

            if (keyframes[i].objects[j].rotchange.x === 0 && keyframes[i].objects[j].rotchange.y === 0 && keyframes[i].objects[j].rotchange.z === 0) {
                //  || (j === 0 && keyframes[i].objects.length > 1) ---> used to be in the IF statement - IDK why

                keyframes[i].objects[j].rotated = false; // Keeps track of whether or not the object rotated since the previous keyframe

            } else {

                keyframes[i].objects[j].rotated = true;

            }

            if (keyframes[i].objects[j].forcerotated) {

                keyframes[i].objects[j].rotated = true;

            }

        }

    }

    // At this point, the '.movechange', '.moved', '.rotated' and '.prev' properties on each object in each keyframe will be set

    // ALWAYS use the actual position of each object in each keyframe as their
    // positions after every time the objects are teleported to the entity that they're supposed to follow
    // The movechange and moved properties might not even be needed any more


    // Reset the scoreboard back to 1 if the animation looping option is checked
    // Otherwise, "reset" it to the animation length (ticks) + 1, so that it doesn't actually reset, but it also doesn't cause a java triple
    var resetScoreTo = 1;

    if (settings.animate.loop === false) {
        resetScoreTo = settings.animate.ticks + 1;
    }
    // This value is used below.

    // If the animation should not be played once initially, then run the code below
    var playOnce = $('#animate-settings-play-once').is(':checked');

    var dontPlayOnceStr = '';

    if (!playOnce) {
        // Should not automatically play initially

        dontPlayOnceStr = ',score_' + settings.uniquestring + '_min=0';

    }


    // Teleport moving armorstands to the main armorstand after the animation

    var getOffset;

    var useHardMovement = $('#animate-settings-hardtp').is(':checked');

    if (currentDirIndex === 0) {
        // This is so that these commands are not added multiple times since that would be useless

        if (useHardMovement) {

            // The command below will make the score on the main armorstand increment, since the 'part' armorstands will be destroyed constantly, and won't keep their scores
            commands[commands.length] = 'scoreboard players add @e[type=armor_stand,name=' + settings.uniquestring + '_M' + dontPlayOnceStr + '] ' + settings.uniquestring + ' 1';

            commands[commands.length] = 'scoreboard players set @e[type=armor_stand,name=' + settings.uniquestring + '_M,score_' + settings.uniquestring + '_min=' + (settings.animate.ticks + 1) + '] ' + settings.uniquestring + ' ' + resetScoreTo;

        } else {
            // "Hard movement" is disabled, so it will be using /tp to move the 'part' armorstands each tick

            // Increase the scoreboard of each object, and reset it to 1 if it is over the animation length (This is not included if "Hard movement" is enabled, because
            // in that case, the main armorstand would be the one with the score incrementing - not each individual armorstand)
            commands[commands.length] = 'scoreboard players add @e[tag=' + settings.uniquestring + dontPlayOnceStr + '] ' + settings.uniquestring + ' 1';
            commands[commands.length] = 'scoreboard players set @e[tag=' + settings.uniquestring + ',score_' + settings.uniquestring + '_min=' + (settings.animate.ticks + 1) + '] ' + settings.uniquestring + ' ' + resetScoreTo;

            // The following command moves the parts back to the main armorstand each tick,
            // so that they can then be offset by another command for that particular keyframe
            if (settings.animate.loop) {
                var mainTag = ',tag=AM_TP';
            } else {
                var mainTag = '';
            }
            // commands[commands.length] = 'execute @e[type=ArmorStand,tag=' + settings.uniquestring + ',score_' + settings.uniquestring + '_min=1] ~ ~ ~ tp @e[type=ArmorStand,tag=' + settings.uniquestring + ',c=1,r=1] @e[type=ArmorStand,name=' + settings.uniquestring + '_M' + mainTag + ',c=1]';
            // commands[commands.length] = 'execute @e[type=ArmorStand,name=' + settings.uniquestring + '_M' + mainTag + '] ~ ~ ~ tp @e[type=ArmorStand,tag=' + settings.uniquestring + ',score_' + settings.uniquestring + '_min=1,c=' + objects.length + '] @e[r=1,c=1]';
            commands[commands.length] = 'execute @e[type=armor_stand,name=' + settings.uniquestring + '_M' + mainTag + '] ~ ~ ~ execute @e[tag=' + settings.uniquestring + ',score_' + settings.uniquestring + '_min=1,c=' + objects.length + '] ~ ~ ~ tp @e[c=1,r=1,type=!Player] @e[type=armor_stand,name=' + settings.uniquestring + '_M,c=1]';
        }

    }

    var currentArmorstandObj;

    var inGamePos = {};


    // Figure out which object UUIDs become invisible anywhere in any keyframe

    var visibilityVaries = []; // Will be a list of UUIDs (strings)

    for (var i = 0; i < keyframes.length; i++) {

        for (var j = 0; j < keyframes[i].objects.length; j++) {

            if (keyframes[i].objects[j].visible === false && $.inArray(keyframes[i].objects[j].uuid, visibilityVaries) === -1) {
                // Object is invisible at one point and its UUID has not already been added to the array

                visibilityVaries[visibilityVaries.length] = keyframes[i].objects[j].uuid;

            }

        }

    }


    for (var i = 0; i < keyframes[0].objects.length; i++) {

        if ($.inArray(keyframes[0].objects[i].uuid, visibilityVaries) !== -1 && !useHardMovement) {
            // The line above includes '!useHardMovement' because if hard mode is enabled, then instead of adding a command, it will never have the summon command for the invisible ticks

            currentArmorstandObj = keyframes[0].objects[i].objref.userData.armorStandRef;

            // The command that makes the hard mode objects visible and adds the block to their head slots (always running)
            commands[commands.length] = 'entitydata @e[tag=' + settings.uniquestring + ',name=' + currentArmorstandObj.customname + '] {' + currentArmorstandObj.itemNBTLoc.replace(/\*/g, currentArmorstandObj.block) + '}';
            // The part, (Tags:["' + settings.uniquestring + '_hm"]) in the line above makes it so that it will only be destroyed after it has that tag (chart below)

        }

    }

    if (useHardMovement) {
        for (var i = 0; i < keyframes[0].objects.length; i++) {
            currentArmorstandObj = keyframes[0].objects[i].objref.userData.armorStandRef;

            // The command that makes the hard mode objects visible and adds the block to their head slots (always running)
            commands[commands.length] = 'entitydata @e[tag=' + settings.uniquestring + ',name=' + currentArmorstandObj.customname + '] {Tags:["' + settings.uniquestring + '_hm"],' + currentArmorstandObj.itemNBTLoc.replace(/\*/g, currentArmorstandObj.block) + '}';
            // The part, (Tags:["' + settings.uniquestring + '_hm"]) in the line above makes it so that it will only be destroyed after it has that tag (chart below)
        }
    }

    // Commands to remove the block from the head at certain times (whenever the armorstand is marked as 'invisible': .userData.visible === false)

    for (var i = 0; i < keyframes.length; i++) {

        // To group adjacent keyframes that all have an invisible object, it will:
        // 1. Loop through and find an invisible object in a keyframe
        // 2. Use a while loop to loop through all adjacent keyframes with that same value
        // 3. If it finds an object in a keyframe, but the same object in the keyframe before is invisible, it has already grouped it, so don't do anything

        for (var j = 0; j < keyframes[i].objects.length; j++) {

            if (keyframes[i].objects[j].visible === false) {

                // Found an invisible object
                // Now, check if that same object is invisible in the previous keyframe

                var prevKeyframe = keyframes[findPreviousKeyframe(keyframes[i].ontick).index];

                if (prevKeyframe !== undefined) {

                    for (var k = 0; k < prevKeyframe.objects.length; k++) {

                        if (prevKeyframe.objects[k].uuid === keyframes[i].objects[j].uuid) {

                            if (prevKeyframe.objects[k].visible === true) {

                                // The object was visible in the previous keyframe. Do the group code and while loop here:
                                // Current keyframe: keyframes[i]
                                // Current object: keyframes[i].objects[j]

                                var consecutiveBroken = false;
                                var currentCheckOntick = keyframes[i].ontick;

                                var endKeyframe;
                                var endKeyframeObj;

                                while (!consecutiveBroken) {

                                    // currentCheckOntick++; // Increase to check next tick // Removed because the findNextKeyframe function already will do this by looking for the NEXT one

                                    var nextKeyframe = findNexKeyframe(currentCheckOntick);

                                    if (nextKeyframe.index === -1) {

                                        // No keyframes are after the last checked one

                                        // Set the end keyframe to the same as the start keyframe // CHANGED: instead of setting it to the last one, it now
                                        // sets it to the final tick on the screen by making a fake keyframe object

                                        endKeyframe = {
                                            ontick: settings.animate.ticks
                                        };

                                        endKeyframeObj = {};

                                        consecutiveBroken = true;

                                    } else {

                                        // There is a keyframe after the last checked one
                                        // Check if the object is invisible in it

                                        endKeyframe = keyframes[nextKeyframe.index];

                                        for (var l = 0; l < keyframes[nextKeyframe.index].objects.length; l++) {

                                            if (keyframes[nextKeyframe.index].objects[l].uuid === keyframes[i].objects[j].uuid) {

                                                // At this point, keyframes[nextKeyframe.index].objects[l] is the same object, but in the next keyframe

                                                endKeyframeObj = keyframes[nextKeyframe.index].objects[l];

                                                if (keyframes[nextKeyframe.index].objects[l].visible === true) {

                                                    // The next object is visible, so end the consecutive invisible variable
                                                    consecutiveBroken = true;

                                                }

                                            }

                                        }

                                    }

                                }

                                // Add the commands here (after the while loop)
                                // Add 1 to any ontick value to get the in-game tick value

                                // Begin keyframe: keyframes[i]
                                // Begin object: keyframes[i].objects[j]

                                // End keyframe: endKeyframe
                                // End object: endKeyframeObj

                                commands[commands.length] = 'entitydata @e[tag=' + settings.uniquestring + ',name=' + keyframes[i].objects[j].customname + ',score_' + settings.uniquestring + '_min=' + (keyframes[i].ontick + 1) + ',score_' + settings.uniquestring + '=' + (endKeyframe.ontick + 1) + '] {ArmorItems:[]}'

                            }

                        }

                    }

                }

            }

        }

    }

    var exportList = '';

    // Main loop

    var enableMultiDir = $('#generate-settings-reusable-multidirectional').is(':checked');

    for (var i = 0; i < keyframes.length; i++) {

        for (var j = 0; j < keyframes[i].objects.length; j++) {

            if (keyframes[i].objects[j].visible === false && useHardMovement) {
                break;
            }

            // Check how many different ticks this tp command should be active for
            var lowestValid = 999999;
            var nextKeyframeIndex = -1;
            for (var k = 0; k < keyframes.length; k++) {
                if (keyframes[k].ontick > keyframes[i].ontick && keyframes[k].ontick < lowestValid && (keyframes[k].objects[j].moved === true || keyframes[k].objects[j].rotated === true)) {
                    lowestValid = keyframes[k].ontick;
                    nextKeyframeIndex = k;
                }
            }

            var ticksBetween = -1;

            if (nextKeyframeIndex === -1) {
                ticksBetween = (settings.animate.ticks - keyframes[i].ontick);
            } else {
                ticksBetween = (keyframes[nextKeyframeIndex].ontick - keyframes[i].ontick) - 1; // Amount of ticks between current keyframe and next one
            }

            // Get rotational offset

            if (keyframes[i].objects[j].objref.userData.rawid === 'armorstand_neck') {

            	getOffset = {
            		x: 0,
            		y: 0,
            		z: 0
            	};

	            inGamePos = {
	                x: fixFloat(settings.offset.x + getOffset.x + keyframes[i].objects[j].position.x),
	                y: fixFloat(settings.offset.y + getOffset.y + keyframes[i].objects[j].position.y),
	                z: fixFloat(settings.offset.z + getOffset.z + keyframes[i].objects[j].position.z)
	            };

	            inGamePos.y -= 0.07;

            } else {

            	getOffset = keyframes[i].objects[j].rotoffset;

	            inGamePos = {
	                x: settings.offset.x + getOffset.x + keyframes[i].objects[j].position.x,
	                y: settings.offset.y + getOffset.y + fixFloat(keyframes[i].objects[j].position.y - ((1 - keyframes[i].objects[j].size) / 2) - ((1.25 / 16) * keyframes[i].objects[j].size)),
	                z: settings.offset.z + getOffset.z + keyframes[i].objects[j].position.z
	            };

	            // It can get static values from the armorstand object, but things that will change, like the y position must be recalculated

	            if (keyframes[i].objects[j].objref.userData.size == 'large') {
	                inGamePos.y -= 1.56;
	            }
	            if (keyframes[i].objects[j].objref.userData.size == 'medium') {
	                inGamePos.y -= 0.66;
	            }
	            if (keyframes[i].objects[j].objref.userData.size == 'small') {
	                inGamePos.y -= 0.5075;
	            }

	            inGamePos.y += 0.0625;

            }

            

            var curObjRotation = {
            	x: -(keyframes[i].objects[j].rotation.x / (Math.PI / 180)),
            	y: (keyframes[i].objects[j].rotation.y / (Math.PI / 180)),
            	z: (keyframes[i].objects[j].rotation.z / (Math.PI / 180))
            };

            if (keyframes[i].objects[j].moved || keyframes[i].objects[j].rotated) {
                // Only move the armorstand if it will actually move

                if (useHardMovement) {
                    // Resummon armorstand each keyframe for "Hard movement"

                    if (keyframes[i].objects[j].objref.userData.rawid === 'armorstand_neck') {
                    	// Blank armorstand object when hard movement is enabled

                    	var curArmorStand = formatBlankArmorstandForKeyframe(keyframes[i].objects[j].objref, keyframes[i]);

                    	if (enableMultiDir) {
	                        var dirScoreSelector = ',score_AM_dir_min=' + currentDirIndex + ',score_AM_dir=' + currentDirIndex; // Only run this /tp command for the current direction index
	                        //(this whole function would be in a loop if multiple-directional placement is enabled)
	                    } else {
	                        var dirScoreSelector = '';
	                    }

	                    currentArmorstandObj = keyframes[i].objects[j].objref.userData.armorStandRef;
	                    var rotationNBT = curArmorStand.pose;

	                    if (curArmorStand.pose.length > 0) {
	                    	commands[commands.length] = 'entitydata @e[tag=' + settings.uniquestring + ',name=' + curArmorStand.customname + dirScoreSelector + ',score_' + settings.uniquestring + '_min=' + (keyframes[i].ontick + 1) + ',score_' + settings.uniquestring + '=' + (keyframes[i].ontick + 1 + ticksBetween) + '] {' + rotationNBT + '}';
	                    }

                    } else if (keyframes[i].objects[j].objref.userData.rawid.indexOf('armorstand_') === -1) {
                    	// Regular object when hard movement is enabled

                    	// Get armorstand object of object
	                    currentArmorstandObj = keyframes[i].objects[j].objref.userData.armorStandRef;

	                    // [Hard movement object process]: Spawn -> wait 1 tick -> become visible & get block on head & get tag_hm -> wait 1 tick -> destroyed because it has the tag

	                    // Now, use the armorstand object in order to generate the summon commands which run every tick to create the "Hard animation"
	                    var rotationNBT = '';

	                    if (curObjRotation.x !== 0 || curObjRotation.y !== 0 || curObjRotation.z !== 0) {
	                        if (currentArmorstandObj.entity === 'villager') {
	                            rotationNBT = 'Rotation:[' + (-curObjRotation.y) + 'f,' + curObjRotation.x + 'f],';
	                        } else {
	                            rotationNBT = 'Pose:{Head:[' + curObjRotation.x + 'f,' + (-curObjRotation.y) + 'f,' + (-curObjRotation.z) + 'f]},';
	                        }
	                    }

	                    // commands[commands.length] = 'execute @e[type=ArmorStand,name=' + settings.uniquestring + '_M,score_' + settings.uniquestring + '_min=' + (keyframes[i].ontick + 1) + ',score_' + settings.uniquestring + '=' + (keyframes[i].ontick + 1 + ticksBetween) + '] ~ ~ ~ summon ' + currentArmorstandObj.entity + ' ' + settings.relPos + inGamePos.x + ' ' + settings.relPos + inGamePos.y + ' ' + settings.relPos + inGamePos.z + ' {' + rotationNBT + (currentArmorstandObj.extraNBT).replace(/,,/g, ',') + '}';

	                    var customnbt = currentArmorstandObj.customnbt;

	                    if (customnbt.length > 0) {
	                        customnbt += ',';
	                    }

	                    commands[commands.length] = 'execute @e[type=armor_stand,name=' + settings.uniquestring + '_M,score_' + settings.uniquestring + '_min=' + (keyframes[i].ontick + 1) + ',score_' + settings.uniquestring + '=' + (keyframes[i].ontick + 1 + ticksBetween) + '] ~ ~ ~ summon ' + currentArmorstandObj.entity + ' ' + settings.relPos + inGamePos.x + ' ' + settings.relPos + inGamePos.y + ' ' + settings.relPos + inGamePos.z + ' {' + customnbt + currentArmorstandObj.pose + (currentArmorstandObj.extraNBT + currentArmorstandObj.itemNBTLoc.replace(/\*/g, currentArmorstandObj.block)).replace(/,,/g, ',') + '}';
                    
                    }

                    
                } else {

                	if (keyframes[i].objects[j].objref.userData.rawid === 'armorstand_neck' || keyframes[i].objects[j].objref.userData.rawid.indexOf('armorstand_') === -1) {

                		if (enableMultiDir) {
	                        var dirScoreSelector = ',score_AM_dir_min=' + currentDirIndex + ',score_AM_dir=' + currentDirIndex; // Only run this /tp command for the current direction index
	                        //(this whole function would be in a loop if multiple-directional placement is enabled)
	                    } else {
	                        var dirScoreSelector = '';
	                    }

	                    var animationScoreSelector = ',score_' + settings.uniquestring + '_min=' + (keyframes[i].ontick + 1) + ',score_' + settings.uniquestring + '=' + (keyframes[i].ontick + 1 + ticksBetween);

	                    // Use regular teleportation each keyframe (no "Hard movement")

	                    if (keyframes[i].objects[j].objref.userData.rawid === 'armorstand_neck') {
	                    	// Blank armorstand teleportation for each frame
	                    	// Each blank armorstand's position for each keyframe is stored in the armorstand_neck object

	                    	commands[commands.length] = 'tp @e[tag=' + settings.uniquestring + dirScoreSelector + ',name=' + keyframes[i].objects[j].objref.parent.parent.parent.parent.parent.userData.nbt.CustomName + animationScoreSelector + '] ' + settings.relPos + inGamePos.x + ' ' + settings.relPos + inGamePos.y + ' ' + settings.relPos + inGamePos.z;	                    	

	                    } else {
	                    	// Regular object teleportation for each frame

	                    	commands[commands.length] = 'tp @e[tag=' + settings.uniquestring + dirScoreSelector + ',name=' + keyframes[i].objects[j].customname + animationScoreSelector + '] ' + settings.relPos + inGamePos.x + ' ' + settings.relPos + inGamePos.y + ' ' + settings.relPos + inGamePos.z;
	                    
	                    }
                	}
                }
            }

            // Rotation animations

            if (keyframes[i].objects[j].rotated || keyframes[i].objects[j].objref.userData.rawid === 'armorstand_neck') {
                // Only change the rotation of the armorstand if it actually changed in rotation on this keyframe

                if (!useHardMovement) {
                    // Only needs a separate /entitydata command for rotation if "Hard movement" is not enabled (rotation & movement can be combined into one /summon command if it is enabled)

                    if (keyframes[i].objects[j].objref.userData.rawid === 'armorstand_neck') {

                    	// Only target one part of each blank armorstand so that it doesn't have 6 different commands to change a single armorstand



	                    // NEW::::
	                    
	                    var curArmorStand = formatBlankArmorstandForKeyframe(keyframes[i].objects[j].objref, keyframes[i]);

	                    // ::::NEW


                    	if (enableMultiDir) {
	                        var dirScoreSelector = ',score_AM_dir_min=' + currentDirIndex + ',score_AM_dir=' + currentDirIndex; // Only run this /tp command for the current direction index
	                        //(this whole function would be in a loop if multiple-directional placement is enabled)
	                    } else {
	                        var dirScoreSelector = '';
	                    }

	                    currentArmorstandObj = keyframes[i].objects[j].objref.userData.armorStandRef;
	                    var rotationNBT = curArmorStand.pose;

	                    commands[commands.length] = 'entitydata @e[tag=' + settings.uniquestring + ',name=' + curArmorStand.customname + dirScoreSelector + ',score_' + settings.uniquestring + '_min=' + (keyframes[i].ontick + 1) + ',score_' + settings.uniquestring + '=' + (keyframes[i].ontick + 1 + ticksBetween) + '] {' + rotationNBT + '}';



                    } else if (keyframes[i].objects[j].objref.userData.rawid.indexOf('armorstand_') === -1) {

                    	// Regular object

                    	if (enableMultiDir) {
	                        var dirScoreSelector = ',score_AM_dir_min=' + currentDirIndex + ',score_AM_dir=' + currentDirIndex; // Only run this /tp command for the current direction index
	                        //(this whole function would be in a loop if multiple-directional placement is enabled)
	                    } else {
	                        var dirScoreSelector = '';
	                    }

	                    currentArmorstandObj = keyframes[i].objects[j].objref.userData.armorStandRef;
	                    var rotationNBT = '';
	                    if (currentArmorstandObj.entity === 'villager') {
	                        rotationNBT = 'Rotation:[' + (-curObjRotation.y) + 'f,' + curObjRotation.x + 'f]';
	                    } else {
	                        rotationNBT = 'Pose:{Head:[' + curObjRotation.x + 'f,' + (-curObjRotation.y) + 'f,' + (-curObjRotation.z) + 'f]}';
	                    }

	                    if (rotationNBT.length > 0) {
	                    	commands[commands.length] = 'entitydata @e[tag=' + settings.uniquestring + ',name=' + keyframes[i].objects[j].customname + dirScoreSelector + ',score_' + settings.uniquestring + '_min=' + (keyframes[i].ontick + 1) + ',score_' + settings.uniquestring + '=' + (keyframes[i].ontick + 1 + ticksBetween) + '] {' + rotationNBT + '}';
	                    }

                    }

                }

            }

            if (returnList !== undefined && returnList === true && keyframes[i].objects[j].finished !== true) {

                // Custom export lists

                if (keyframes[i].objects[j].objref.userData.rawid.indexOf('armorstand_') === -1) {

                    // Regular objects

                    exportList += '\n' + keyframes[i].objects[j].objref.userData.name;

                    if (settings.exportCustom.ids) {
                        exportList += ' ' + keyframes[i].objects[j].objref.userData.rawid;
                    }

                    exportList += ' [Tick ' + Math.round(keyframes[i].ontick) + ']:';

                    if (settings.exportCustom.positions) {
                        exportList += (' (' + parseFloat(inGamePos.x.toFixed(6)) + ', ' + parseFloat(inGamePos.y.toFixed(6)) + ', ' + parseFloat(inGamePos.z.toFixed(6)) + ')').replace(/([( ,])([0-9]+)([),])/g, '$1$2.0$3'); // Add positions to current line
                    }

                    if (settings.exportCustom.rotations) {
                        exportList += ' Pose:{Head:[' + (-Math.round(curObjRotation.x)) + 'f,' + (-Math.round(curObjRotation.y)) + 'f,' + (-Math.round(curObjRotation.z)) + 'f]}'; // Add rotations to current line
                    }

                }

                if (keyframes[i].objects[j].objref.userData.rawid === 'armorstand_neck') {

                	// Find blank armorstand parent object
                	var curBlankArmorstand = keyframes[i].objects[j].objref.parent.parent.parent.parent.parent;

                    // The entire blank armorstand's data will be printed together when the current object is the armorstand_torso

                    exportList += '\n' + keyframes[i].objects[j].objref.userData.name;

                    if (settings.exportCustom.ids) {
                        exportList += ' ArmorStand';
                    }

                    // Add the item ids in each slot of the armorstand if the setting is enabled for custom lists
                    if (settings.exportCustom.armorstandslots) {

                    	var armorStandSlotsList = '';

                    	armorStandSlotsList += ' [';

                    	for (var k = 0; k < curBlankArmorstand.userData.nbt.ArmorItems.length; k++) {

                    		// Only display slots that have an item in them
                    		if (curBlankArmorstand.userData.nbt.ArmorItems[k] !== '{}') {

                    			armorStandSlotsList += ', ';

                    			switch(k) {
	                    			case 0:
	                    				armorStandSlotsList += 'Boots ';
	                    				break;
	                    			case 1:
	                    				armorStandSlotsList += 'Legs ';
	                    				break;
	                    			case 2:
	                    				armorStandSlotsList += 'Chest ';
	                    				break;
	                    			case 3:
	                    				armorStandSlotsList += 'Head ';
	                    				break;
	                    		}

	                    		armorStandSlotsList += getItemIdFromNBT(curBlankArmorstand.userData.nbt.ArmorItems[k]).replace(' ', ':');

                    		}

                    	}

                    	for (var k = 0; k < curBlankArmorstand.userData.nbt.HandItems.length; k++) {

                    		// Only display slots that have an item in them
                    		if (curBlankArmorstand.userData.nbt.HandItems[k] !== '{}') {

                    			armorStandSlotsList += ', ';

                    			switch(k) {
	                    			case 1:
	                    				armorStandSlotsList += 'LeftArm ';
	                    				break;
	                    			case 0:
	                    				armorStandSlotsList += 'RightArm ';
	                    				break;
	                    		}

	                    		armorStandSlotsList += getItemIdFromNBT(curBlankArmorstand.userData.nbt.HandItems[k]).replace(' ', ':');

                    		}

                    	}

                    	armorStandSlotsList += ']';

                    	// Remove first extra comma
                    	armorStandSlotsList = armorStandSlotsList.replace('[, ', '[');

                    	exportList += armorStandSlotsList;

                    }

                    exportList += ' [Tick ' + Math.round(keyframes[i].ontick) + ']:';

                    if (settings.exportCustom.positions) {
                        exportList += (' (' + parseFloat(inGamePos.x.toFixed(6)) + ', ' + parseFloat(inGamePos.y.toFixed(6)) + ', ' + parseFloat(inGamePos.z.toFixed(6)) + ')').replace(/([( ,])([0-9]+)([),])/g, '$1$2.0$3'); // Add positions to current line
                    }

                    if (settings.exportCustom.rotations) {

                        // Armorstand parts rotations (This chunk of code is from /armorstand/index.html)
                        var curArmorstandPart = '';
                        var leftOrRightArm = 'Right';
                        var leftOrRightLeg = 'Right';

                        var currentArmSway = {
                            x: 0,
                            y: 0,
                            z: 0
                        };

                        var armSwayInput = {
                            x: Math.round($('#animate-settings-arm-sway-x').val()),
                            y: Math.round($('#animate-settings-arm-sway-y').val()),
                            z: Math.round($('#animate-settings-arm-sway-z').val()),
                            ticks: Math.round($('#animate-settings-arm-sway-ticks').val())
                        };

                        var doArmSway = $('#animate-settings-arm-sway').is(':checked');

                        if (doArmSway && curBlankArmorstand.userData.armSwayInitOffsetLeft == undefined) {

                            curBlankArmorstand.userData.armSwayInitOffsetLeft = {
                                x: Math.round(Math.random() * armSwayInput.ticks),
                                y: Math.round(Math.random() * armSwayInput.ticks),
                                z: Math.round(Math.random() * armSwayInput.ticks)
                            };

                            curBlankArmorstand.userData.armSwayInitOffsetRight = {
                                x: Math.round(Math.random() * armSwayInput.ticks),
                                y: Math.round(Math.random() * armSwayInput.ticks),
                                z: curBlankArmorstand.userData.armSwayInitOffsetLeft.z + ((armSwayInput.ticks / 16) - Math.round(Math.random() * (armSwayInput.ticks / 8)))
                            };

                        }

                        var curKeyframeObj;

                        var curRotation = '';
                        var curPose = '';

                        for (var k = 0; k < curBlankArmorstand.children.length; k++) {
                            switch (curBlankArmorstand.children[k].children[0].children[0].children[0].children[0].userData.rawid) {
                                case 'armorstand_neck':
                                    curArmorstandPart = 'Head';
                                    break;
                                case 'armorstand_torso':
                                    curArmorstandPart = 'Body';
                                    break;
                                case 'armorstand_arm':
                                    curArmorstandPart = leftOrRightArm + 'Arm';
                                    leftOrRightArm = 'Left'; // This makes it so that the second time this runs, it will be the RightArm
                                    break;
                                case 'armorstand_leg':
                                    curArmorstandPart = leftOrRightLeg + 'Leg';
                                    leftOrRightLeg = 'Left'; // This makes it so that the second time this runs, it will be the RightLeg
                                    break;
                            }

                            for (var l = 0; l < keyframes[i].objects.length; l++) {
                                if (curBlankArmorstand.children[k].children[0].children[0].children[0].children[0].uuid === keyframes[i].objects[l].uuid) {
                                    curKeyframeObj = keyframes[i].objects[l];
                                    break;
                                }
                            }

                            if (curBlankArmorstand.children[k].children[0].children[0].children[0].children[0].userData.rawid === 'armorstand_torso') {
                                curRotation = 'Rotation:[' + (-curKeyframeObj.position.y / (Math.PI / 180)) + 'f]';
                            }

                            currentArmSway.x = 0;
                            currentArmSway.y = 0;
                            currentArmSway.z = 0;

                            if (doArmSway && curArmorstandPart === 'LeftArm') {
                                currentArmSway.x = (Math.sin((((keyframes[i].ontick + curBlankArmorstand.userData.armSwayInitOffsetLeft.x) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.x) - armSwayInput.x;
                                currentArmSway.y = (Math.sin((((keyframes[i].ontick + curBlankArmorstand.userData.armSwayInitOffsetLeft.y) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.y) - armSwayInput.y;
                                currentArmSway.z = -((Math.sin((((keyframes[i].ontick + curBlankArmorstand.userData.armSwayInitOffsetLeft.z) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.z) - armSwayInput.z);
                            }
                            if (doArmSway && curArmorstandPart === 'RightArm') {
                                currentArmSway.x = (Math.sin((((keyframes[i].ontick + curBlankArmorstand.userData.armSwayInitOffsetRight.x) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.x) - armSwayInput.x;
                                currentArmSway.y = (Math.sin((((keyframes[i].ontick + curBlankArmorstand.userData.armSwayInitOffsetRight.y) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.y) - armSwayInput.y;
                                currentArmSway.z = (Math.sin((((keyframes[i].ontick + curBlankArmorstand.userData.armSwayInitOffsetRight.z) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.z) - armSwayInput.z;
                            }

                            //if (parseFloat((curBlankArmorstand.children[k].children[0].children[0].children[0].rotation.x / (pi / 180)).toFixed(5)) + ',' + (-(parseFloat((curBlankArmorstand.children[k].children[0].children[0].rotation.y / (pi / 180)).toFixed(5)))) + ',' + (-parseFloat((curBlankArmorstand.children[k].children[0].rotation.z / (pi / 180)).toFixed(5))) !== '0,0,0' || curArmorstandPart === 'LeftArm' || curArmorstandPart === 'RightArm') {
                            if (true) {
                                // Only add to the Pose:{} tag if any of the values are different that default (0)
                                // curPose += ',' + curArmorstandPart + ':[' + parseFloat((curKeyframeObj.rotation.x / (pi / 180)).toFixed(5)) + 'f,' + (-(parseFloat((curKeyframeObj.rotation.y / (pi / 180)).toFixed(5)))) + 'f,' + (-parseFloat((curKeyframeObj.rotation.z / (pi / 180)).toFixed(5))) + 'f]';
                                
                                curPose += ',' + curArmorstandPart + ':[' + parseFloat(((curKeyframeObj.rotation.x / (pi / 180)) + currentArmSway.x).toFixed(5)) + 'f,' + (-(parseFloat(((curKeyframeObj.rotation.y / (pi / 180)) + currentArmSway.y).toFixed(5)))) + 'f,' + (-parseFloat(((curKeyframeObj.rotation.z / (pi / 180)) + currentArmSway.z).toFixed(5))) + 'f]';
                            }

                        }

                        // Remove first comma from the .pose property and encase it in the "Pose:{}" tag
                        curPose = ('Pose:{' + curPose + '}').replace('{,', '{');

                        exportList += ' ' + curRotation + ',' + curPose; // Add rotations to current line
                    }

                }

                keyframes[i].objects[j].finished = true;

            }

        }

        // Custom commands
        // (is after the object moving stuff for this keyframe so that it executes at the new location; not the old one)

        if (keyframes[i].cc === undefined)
            keyframes[i].cc = [];

        for (var j = 0; j < keyframes[i].cc.length; j++) {
            // Custom commands loop for this keyframe

            commands[commands.length] = keyframes[i].cc[j].command;

            if (settings.exportCustom.cc) {
                exportList += '\n[Tick ' + Math.round(keyframes[i].ontick) + ']: [COMMAND]: ' + keyframes[i].cc[j].command;
            }

        }

    }

    for (var i = 0; i < keyframes.length; i++) {
        for (var j = 0; j < keyframes[i].objects.length; j++) {
            delete keyframes[i].objects[j].finished;
        }
    }

    if (returnList !== undefined && returnList === true) {
        return exportList.replace('\n', '');
    }

    if (useHardMovement) {
        // If useHardMovement is true, make a command that destroys all object armorstands every tick, so that it can be resummoned each tick

        commands[commands.length] = 'tp @e[tag=' + settings.uniquestring + '_hm] ~ ~-500 ~';
    }

    // Tag which signals that the _M armorstand is ready for teleporting
    if (settings.animate.loop) {
        // commands[commands.length] = 'scoreboard players add @e[type=ArmorStand,name=' + settings.uniquestring + '_M] ' + settings.uniquestring + ' 0';
        // commands[commands.length] = 'scoreboard players remove @e[type=ArmorStand,name=' + settings.uniquestring + '_M,score_' + settings.uniquestring + '=0] ' + settings.uniquestring + ' 1';
        // commands[commands.length] = 'scoreboard players set @e[type=ArmorStand,name=' + settings.uniquestring + '_M,score_' + settings.uniquestring + '=-15] ' + settings.uniquestring + ' 1';
        if (currentDirIndex === 0)
            commands[commands.length] = 'scoreboard players tag @e[type=armor_stand,name=' + settings.uniquestring + '_M] add AM_TP';
    }


    // Cleanup commands

    for (var i = 0; i < commands.length; i++) {
        commands[i] = commands[i].replace(/,,/g, ',').replace(/{,/g, '{').replace(/,}/g, '}');
    }

    removeTempFrames();

    return commands;
}

function formatBlankArmorstandForKeyframe(neckObject, curKeyframe) {
	// Finds the parent blank armorstand, and formats all of the parts into the curArmorStand object then returns it. This is used to generate the positions of the armorstand for keyframes

	// Find the Object and UUID of the blank armorstand parent holding all of the parts, including the current armorstand_neck object
	var curBlankArmorstand = neckObject.parent.parent.parent.parent.parent;

	var curArmorStand = {
        x: curBlankArmorstand.position.x + settings.offset.x,
        y: fixFloat(curBlankArmorstand.position.y + settings.offset.y) - 0.07,
        z: curBlankArmorstand.position.z + settings.offset.z,
        isBlankArmorstand: true,
        extraNBT: '',
        entity: 'armor_stand',
        pose: '',
        customname: curBlankArmorstand.userData.nbt.CustomName
    };

    if (settings.relPos === '~') {

        if (settings.selected.mode == 'single') {
            curArmorStand.y -= 3;
        }
        if (settings.selected.mode == 'reusable') {
            curArmorStand.y += 0.0625;
        }

    }

    // Armorstand options

    var wholeArmorstandRot = parseFloat(-(curBlankArmorstand.rotation.y / (pi / 180)).toFixed(5));
    if (wholeArmorstandRot !== 0) {
    	curArmorStand.extraNBT += ',Rotation:[' + wholeArmorstandRot + 'f]';
    }

    var equipmentAltered = false; // Only include HandItems and ArmorItems if one of the parts have been altered by the user

    for (var key in curBlankArmorstand.userData.nbt) {

    	if (curBlankArmorstand.userData.nbt[key] === true) {
    		curArmorStand.extraNBT += ',' + key + ':1';
    	}

    	if (key === 'ArmorItems' || key === 'HandItems' ) {

    		equipmentAltered = false;

    		for (var k = 0; k < curBlankArmorstand.userData.nbt[key].length; k++) {

    			if (curBlankArmorstand.userData.nbt[key][k] !== '{}' && curBlankArmorstand.userData.nbt[key][k] !== '') {
    				equipmentAltered = true;
    			}

    		}

    		// NBT Tag adding:

    		if (equipmentAltered) {

    			curArmorStand.extraNBT += ',' + key + ':[';

    			for (var k = 0; k < curBlankArmorstand.userData.nbt[key].length; k++) {
    				curArmorStand.extraNBT += curBlankArmorstand.userData.nbt[key][k];

    				if (k < curBlankArmorstand.userData.nbt[key].length - 1) {
    					curArmorStand.extraNBT += ',';
    				}
    			}

    			curArmorStand.extraNBT += ']';

    		}
    	}

    }

    curArmorStand.extraNBT = curArmorStand.extraNBT.replace(',', '');

    // Armorstand parts rotations
    var curArmorstandPart = '';
    var leftOrRightArm = 'Right';
    var leftOrRightLeg = 'Right';

    var currentArmSway = {
        x: 0,
        y: 0,
        z: 0
    };

    var armSwayInput = {
        x: Math.round($('#animate-settings-arm-sway-x').val()),
        y: Math.round($('#animate-settings-arm-sway-y').val()),
        z: Math.round($('#animate-settings-arm-sway-z').val()),
        ticks: Math.round($('#animate-settings-arm-sway-ticks').val())
    };

    var doArmSway = $('#animate-settings-arm-sway').is(':checked');

    if (doArmSway && curBlankArmorstand.userData.armSwayInitOffsetLeft == undefined) {

        curBlankArmorstand.userData.armSwayInitOffsetLeft = {
            x: Math.round(Math.random() * armSwayInput.ticks),
            y: Math.round(Math.random() * armSwayInput.ticks),
            z: Math.round(Math.random() * armSwayInput.ticks)
        };

        curBlankArmorstand.userData.armSwayInitOffsetRight = {
            x: Math.round(Math.random() * armSwayInput.ticks),
            y: Math.round(Math.random() * armSwayInput.ticks),
            z: curBlankArmorstand.userData.armSwayInitOffsetLeft.z + ((armSwayInput.ticks / 16) - Math.round(Math.random() * (armSwayInput.ticks / 8)))
        };

    }

    for (var k = 0; k < curBlankArmorstand.children.length; k++) {
        switch (curBlankArmorstand.children[k].children[0].children[0].children[0].children[0].userData.rawid) {
            case 'armorstand_neck':
                curArmorstandPart = 'Head';
                break;
            case 'armorstand_torso':
                curArmorstandPart = 'Body';
                break;
            case 'armorstand_arm':
                curArmorstandPart = leftOrRightArm + 'Arm';
                leftOrRightArm = 'Left'; // This makes it so that the second time this runs, it will be the RightArm
                break;
            case 'armorstand_leg':
                curArmorstandPart = leftOrRightLeg + 'Leg';
                leftOrRightLeg = 'Left'; // This makes it so that the second time this runs, it will be the RightLeg
                break;
        }

        // Find the object the keyframes[].objects[] array, so the rotation from the object in the current keyframe can be used
        for (var l = 0; l < curKeyframe.objects.length; l++) {
            // cur = keyframes[i].objects[l];

            currentArmSway.x = 0;
            currentArmSway.y = 0;
            currentArmSway.z = 0;

            if (curKeyframe.objects[l].uuid === curBlankArmorstand.children[k].children[0].children[0].children[0].children[0].uuid) {

                if (curBlankArmorstand.children[k].children[0].children[0].children[0].children[0].userData.rawid === 'armorstand_torso') {
                    var curArmorStandRot = ',Rotation:[' + (curKeyframe.objects[l].position.y / (Math.PI / 180)) + 'f]';
                }

                if (doArmSway && curArmorstandPart === 'LeftArm') {
                    currentArmSway.x = (Math.sin((((curKeyframe.ontick + curBlankArmorstand.userData.armSwayInitOffsetLeft.x) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.x) - armSwayInput.x;
                    currentArmSway.y = (Math.sin((((curKeyframe.ontick + curBlankArmorstand.userData.armSwayInitOffsetLeft.y) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.y) - armSwayInput.y;
                    currentArmSway.z = -((Math.sin((((curKeyframe.ontick + curBlankArmorstand.userData.armSwayInitOffsetLeft.z) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.z) - armSwayInput.z);
                }
                if (doArmSway && curArmorstandPart === 'RightArm') {
                    currentArmSway.x = (Math.sin((((curKeyframe.ontick + curBlankArmorstand.userData.armSwayInitOffsetRight.x) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.x) - armSwayInput.x;
                    currentArmSway.y = (Math.sin((((curKeyframe.ontick + curBlankArmorstand.userData.armSwayInitOffsetRight.y) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.y) - armSwayInput.y;
                    currentArmSway.z = (Math.sin((((curKeyframe.ontick + curBlankArmorstand.userData.armSwayInitOffsetRight.z) % armSwayInput.ticks) / armSwayInput.ticks) * 2 * pi) * armSwayInput.z) - armSwayInput.z;
                }

                // Setup the armorStand[] reference in each child of the blank armorstand
                curBlankArmorstand.children[k].children[0].children[0].children[0].children[0].userData.armorStandRef = curArmorStand;

                if (parseFloat(((curKeyframe.objects[l].rotation.x / (pi / 180)) + currentArmSway.x).toFixed(5)) + ',' + (-(parseFloat(((curKeyframe.objects[l].rotation.y / (pi / 180)) + currentArmSway.y).toFixed(5)))) + ',' + (-parseFloat(((curKeyframe.objects[l].rotation.z / (pi / 180)) + currentArmSway.z).toFixed(5))) !== '0,0,0' || curArmorstandPart === 'LeftArm' || curArmorstandPart === 'RightArm') {
                    // Only add to the Pose:{} tag if any of the values are different that default (0)
                    curArmorStand.pose += ',' + curArmorstandPart + ':[' + parseFloat(((curKeyframe.objects[l].rotation.x / (pi / 180)) + currentArmSway.x).toFixed(5)) + 'f,' + (-(parseFloat(((curKeyframe.objects[l].rotation.y / (pi / 180)) + currentArmSway.y).toFixed(5)))) + 'f,' + (-parseFloat(((curKeyframe.objects[l].rotation.z / (pi / 180)) + currentArmSway.z).toFixed(5))) + 'f]';
                }

                break;
                
            }
        }

    }

    // Remove first comma from the .pose property and encase it in the "Pose:{}" tag
    if (curArmorStand.pose.length > 0) {
        curArmorStand.pose = ('Pose:{' + curArmorStand.pose + '},').replace('{,', '{');
    }

    curArmorStand.pose += curArmorStandRot;

    return curArmorStand;

}

$('#animate-settings-arm-sway-ticks').change(function() {

    for (var i = 0; i < blankArmorstands.length; i++) {

        delete blankArmorstands[i].userData.armSwayInitOffsetLeft;
        delete blankArmorstands[i].userData.armSwayInitOffsetRight;

    }

});