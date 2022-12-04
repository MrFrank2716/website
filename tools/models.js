currentBlock = '';

models = {

	addToScene: true,

	getParentTexture: function(textureref) {
		// textureref is the texture reference on the actual model file (which has north, south, etc)

		textureref = textureref.replace('#', '');

		var globalTexRefs = [];
		for (var i = 0; i < models.tryLoadModelAccumulate.textures.length; i++) {
			globalTexRefs[globalTexRefs.length] = JSON.parse(models.tryLoadModelAccumulate.textures[i]);
		}

		for (var i = 0; i < globalTexRefs.length; i++) {

			if (globalTexRefs[i][textureref] !== undefined) {

				// Found the reference
				// Check if the reference points to another reference or to a file
				if (globalTexRefs[i][textureref].indexOf('#') === -1) {

					if (globalTexRefs[i][textureref] === undefined) {

						return 'bedrock';

					} else {

						return globalTexRefs[i][textureref];

					}

				} else {

					return models.getParentTexture(globalTexRefs[i][textureref]);

				}

			}

		}

		return textureref; // Return the input, because it wasn't actually a texture reference. It was a texture file path

	},

	curUVsides: ['north', 'east', 'south', 'west', 'up', 'down'],

	loadJSON: function(jsonText, currentBlock, retain, callback) {

		console.log('Loading json file for: ' + currentBlock);

		var model = JSON.parse(jsonText);

		if (model.elements === undefined) {
			model.elements = [];
		}

		// console.log(model);

		// Turn elements of model into segments then compile and add to scene

		var textures;

		var segments = [];

		var currentElement = {};

		// Now, texrefs is an array of the names of the texture files in the blocks folder (not including the "blocks/" part)

		for (var i = 0; i < models.tryLoadModelAccumulate.elements.length; i++) {

			if (typeof models.tryLoadModelAccumulate.elements[i] == 'string') {
				model.elements[model.elements.length] = JSON.parse(models.tryLoadModelAccumulate.elements[i]);
			} else {
				model.elements[model.elements.length] = models.tryLoadModelAccumulate.elements[i];
			}
			
		}

		// Model display on head

		var display;

		if (retain.displaySlot === undefined || retain.displaySlot === 0) {

			if (model.display !== undefined && model.display.head !== undefined) {
				display = {
					rotation: {
						x: -model.display.head.rotation[0],
						y: model.display.head.rotation[1] + 180,
						z: model.display.head.rotation[2]
					},
					translation: {
						x: -model.display.head.translation[0],
						y: model.display.head.translation[1],
						z: -model.display.head.translation[2]
					},
					scale: {
						x: model.display.head.scale[0],
						y: model.display.head.scale[1],
						z: model.display.head.scale[2]
					}
				}

			} else {

				display = undefined;

			}
		
		} else {

			display = undefined;

			if (retain.displaySlot !== undefined) {

				// Might have to remove the negative on the following 2 blocks of code for the x rotation in the displays

				// Left hand (For some reason, the 2 and 3 for left hand and right hand had to be swapped... UPDATE: NVM)
				if (model.display !== undefined && model.display.thirdperson_lefthand !== undefined && retain.displaySlot === 3) {
					display = {
						rotation: {
							x: -model.display.thirdperson_lefthand.rotation[0],
							y: -model.display.thirdperson_lefthand.rotation[1] + 180,
							z: -model.display.thirdperson_lefthand.rotation[2]
						},
						translation: {
							x: model.display.thirdperson_lefthand.translation[0],
							y: model.display.thirdperson_lefthand.translation[1],
							z: model.display.thirdperson_lefthand.translation[2]
						},
						scale: {
							x: model.display.thirdperson_lefthand.scale[0],
							y: model.display.thirdperson_lefthand.scale[1],
							z: model.display.thirdperson_lefthand.scale[2]
						}
					}
				}

				// Right hand
				if (model.display !== undefined && model.display.thirdperson_righthand !== undefined && retain.displaySlot === 2) {
					display = {
						rotation: {
							x: -model.display.thirdperson_righthand.rotation[0],
							y: model.display.thirdperson_righthand.rotation[1] + 180,
							z: model.display.thirdperson_righthand.rotation[2]
						},
						translation: {
							x: -model.display.thirdperson_righthand.translation[0],
							y: model.display.thirdperson_righthand.translation[1],
							z: model.display.thirdperson_righthand.translation[2]
						},
						scale: {
							x: model.display.thirdperson_righthand.scale[0],
							y: model.display.thirdperson_righthand.scale[1],
							z: model.display.thirdperson_righthand.scale[2]
						}
					}
				}

			}

		}


		for (var i = 0; i < model.elements.length; i++) {

			for (var k = 0; k < models.curUVsides.length; k++) {

				if (model.elements[i].faces[models.curUVsides[k]] === undefined) {

					model.elements[i].faces[models.curUVsides[k]] = {}; // First, make the blank property for the blank side

					model.elements[i].faces[models.curUVsides[k]].texture = 'nothing'; // Transparent 1x1 texture

				}

			}

			textures = models.texFaces({
				north: {
					path: models.getParentTexture(model.elements[i].faces.north.texture)
				},
				east: {
					path: models.getParentTexture(model.elements[i].faces.east.texture)
				},
				south: {
					path: models.getParentTexture(model.elements[i].faces.south.texture)
				},
				west: {
					path: models.getParentTexture(model.elements[i].faces.west.texture)
				},
				up: {
					path: models.getParentTexture(model.elements[i].faces.up.texture)
				},
				down: {
					path: models.getParentTexture(model.elements[i].faces.down.texture)
				}
			});

			currentElement.size = {
				x: (model.elements[i].to[0] - model.elements[i].from[0]) / 16,
				y: (model.elements[i].to[1] - model.elements[i].from[1]) / 16,
				z: (model.elements[i].to[2] - model.elements[i].from[2]) / 16
			}

			currentElement.position = {
				x: (((model.elements[i].from[0] + model.elements[i].to[0]) / 2) / 16) - 0.5,
				y: (((model.elements[i].from[1] + model.elements[i].to[1]) / 2) / 16) - 0.5,
				z: (((model.elements[i].from[2] + model.elements[i].to[2]) / 2) / 16) - 0.5
			}

			for (var axis in currentElement.size) {
				if (currentElement.size[axis] === 0) {
					currentElement.size[axis] = 0.1;
				}
			}

			// Geometry for segment
			var curGeometry = new THREE.BoxGeometry(currentElement.size.x, currentElement.size.y, currentElement.size.z);

			// MeshFaceMaterial for segment
			var curMaterial = new THREE.MeshFaceMaterial(textures);

			// Apply UV mapping from JSON file

			curGeometry.faceVertexUvs[0] = [];

			var curUV = {
				north: model.elements[i].faces.north.uv,
				east: model.elements[i].faces.east.uv,
				south: model.elements[i].faces.south.uv,
				west: model.elements[i].faces.west.uv,
				up: model.elements[i].faces.up.uv,
				down: model.elements[i].faces.down.uv
			}
			// curUV is an object containing an array of UV mapping for each face

			// Fill in any blank UV mapping sides
			for (key in curUV) {
				if (curUV[key] === undefined) {

					// If not specified, generate uv mapping from element's position for the undefined face

					if (key === 'up' || key === 'down') {
						curUV[key] = [model.elements[i].from[0], model.elements[i].from[2], model.elements[i].to[0], model.elements[i].to[2]]; // Top/bottom face
					} else if (key === 'north' || key === 'south') {
						curUV[key] = [model.elements[i].from[0], model.elements[i].from[1], model.elements[i].to[0], model.elements[i].to[1]]; // North/south face
					} else if (key === 'west' || key === 'east') {
						curUV[key] = [model.elements[i].from[2], model.elements[i].from[1], model.elements[i].to[2], model.elements[i].to[1]]; // West/east face
					}

				}
			}

			curUVvectors = {
				north: null,
				east: null,
				south: null,
				west: null,
				up: null,
				down: null
			};

			// Divide all curUV values by 16 so it is fitted to the 1x1x1 box geometry

			for (var j = 0; j < models.curUVsides.length; j++) {

				for (var k = 0; k < curUV[models.curUVsides[j]].length; k++) {

					curUV[models.curUVsides[j]][k] = curUV[models.curUVsides[j]][k] / 16;

				}

				// Turn the 2 points into a 4-pointed square, with these being the corner coordinates:
				// curUV[models.curUVsides[j]][0 and 2] are x (u) coordinates. curUV[models.curUVsides[j]][1 and 3] are y (v) coordinates

				var firstCoordinate = {x: curUV[models.curUVsides[j]][0], y: 1-curUV[models.curUVsides[j]][1]};
				var secondCoordinate = {x: curUV[models.curUVsides[j]][2], y: 1-curUV[models.curUVsides[j]][3]};

				if (models.curUVsides[j] === 'up' || models.curUVsides[j] === 'down') {
					curUVvectors[models.curUVsides[j]] = [
						new THREE.Vector2(firstCoordinate.x, secondCoordinate.y),
						new THREE.Vector2(firstCoordinate.x, firstCoordinate.y),
						new THREE.Vector2(secondCoordinate.x, firstCoordinate.y),
						new THREE.Vector2(secondCoordinate.x, secondCoordinate.y),
					]
				} else {
					curUVvectors[models.curUVsides[j]] = [
						new THREE.Vector2(secondCoordinate.x, firstCoordinate.y),
						new THREE.Vector2(secondCoordinate.x, secondCoordinate.y),
						new THREE.Vector2(firstCoordinate.x, secondCoordinate.y),
						new THREE.Vector2(firstCoordinate.x, firstCoordinate.y),
					]
				}

			}

			// Apply UV mapping

			curGeometry.faceVertexUvs[0][0] = [ curUVvectors.west[0], curUVvectors.west[1], curUVvectors.west[3] ];
			curGeometry.faceVertexUvs[0][1] = [ curUVvectors.west[1], curUVvectors.west[2], curUVvectors.west[3] ];
			  
			curGeometry.faceVertexUvs[0][2] = [ curUVvectors.east[0], curUVvectors.east[1], curUVvectors.east[3] ];
			curGeometry.faceVertexUvs[0][3] = [ curUVvectors.east[1], curUVvectors.east[2], curUVvectors.east[3] ];
			  
			curGeometry.faceVertexUvs[0][4] = [ curUVvectors.up[0], curUVvectors.up[1], curUVvectors.up[3] ];
			curGeometry.faceVertexUvs[0][5] = [ curUVvectors.up[1], curUVvectors.up[2], curUVvectors.up[3] ];
			  
			curGeometry.faceVertexUvs[0][6] = [ curUVvectors.down[0], curUVvectors.down[1], curUVvectors.down[3] ];
			curGeometry.faceVertexUvs[0][7] = [ curUVvectors.down[1], curUVvectors.down[2], curUVvectors.down[3] ];
			  
			curGeometry.faceVertexUvs[0][8] = [ curUVvectors.south[0], curUVvectors.south[1], curUVvectors.south[3] ];
			curGeometry.faceVertexUvs[0][9] = [ curUVvectors.south[1], curUVvectors.south[2], curUVvectors.south[3] ];
			  
			curGeometry.faceVertexUvs[0][10] = [ curUVvectors.north[0], curUVvectors.north[1], curUVvectors.north[3] ];
			curGeometry.faceVertexUvs[0][11] = [ curUVvectors.north[1], curUVvectors.north[2], curUVvectors.north[3] ];

			// Create segment
			segments[segments.length] = new THREE.Mesh(curGeometry, curMaterial);
			var curSeg = segments[segments.length-1];

			curSeg.position.set(currentElement.position.x, currentElement.position.y, currentElement.position.z);

			// Rotation offsets for each individual segment
			if (model.elements[i].rotation !== undefined) {
				
				var tempOffsetMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color: 0x9933ff}));
				curSeg.add(tempOffsetMesh);

				var originLocWithoutRot = new THREE.Vector3();
				originLocWithoutRot.x = ((model.elements[i].rotation.origin[0] / 16) - 0.5) - curSeg.position.x;
				originLocWithoutRot.y = ((model.elements[i].rotation.origin[1] / 16) - 0.5) - curSeg.position.y;
				originLocWithoutRot.z = ((model.elements[i].rotation.origin[2] / 16) - 0.5) - curSeg.position.z;

				tempOffsetMesh.position.set(originLocWithoutRot.x, originLocWithoutRot.y, originLocWithoutRot.z);

				// Set the withoutrot to be the matrix world, so that it is easier to compare the difference afterwards
				tempOffsetMesh.updateMatrixWorld();
				tempOffsetMesh.parent.updateMatrixWorld();
				originLocWithoutRot.setFromMatrixPosition(tempOffsetMesh.matrixWorld);

				// Now the tempOffsetMesh is at the correct location of the origin, and is a child of the segment

				// Permanently rotate the segment
				curSeg.rotation[model.elements[i].rotation.axis] = model.elements[i].rotation.angle * (pi / 180);

				// Calculate the offset from the locWithoutRot to the new LocWithRot
				tempOffsetMesh.updateMatrixWorld();
				tempOffsetMesh.parent.updateMatrixWorld();
				var originLocWithRot = new THREE.Vector3();
				originLocWithRot.setFromMatrixPosition(tempOffsetMesh.matrixWorld);

				// Find difference from withoutRot and WithRot
				var tempDifference = new THREE.Vector3();

				tempDifference.x = originLocWithRot.x - originLocWithoutRot.x;
				tempDifference.y = originLocWithRot.y - originLocWithoutRot.y;
				tempDifference.z = originLocWithRot.z - originLocWithoutRot.z;

				// Now, move the object in the negated form of that difference
				curSeg.position.x -= tempDifference.x;
				curSeg.position.y -= tempDifference.y;
				curSeg.position.z -= tempDifference.z;

				curSeg.remove(tempOffsetMesh);

			}

			// Add the translation to the segment : CHANGED - now applys the translation to the child of the topparent for the object
			// if (display !== undefined) {
			// 	curSeg.position.x += display.translation.x / 16;
			// 	curSeg.position.y += display.translation.y / 16;
			// 	curSeg.position.z += display.translation.z / 16;
			// }
			

		}

		

		// Compile segments then add to scenes
		var compiledObject = models.compile({seg: segments, isItem: false, modelDisplay: display, currentBlock: currentBlock});
		var newObject = compiledObject.obj;
		var newObjectTopParent = compiledObject.topparent;

		newObject.userData.justAdded = true;

		callback({
			topparent: newObjectTopParent,
			obj: newObject,
			retain: retain
		});

		if (!settings.importing && !settings.dontSelect && !retain.dontCreateKeyframe)
			models.updateKeyframesAfterAddObj();

	},

	updateKeyframesAfterAddObj: function() {
		// Update all keyframes by adding the new object whenever a new object is added to the scene

		// Update current keyframe
		// Waits 1 milisecond for new object to be added to scene
		window.setTimeout(function() {
			if (!settings.importing && keyframeAt(animatePlayhead.ontick) !== false)
				updateKeyframeAt(animatePlayhead.ontick);

			// First, get copy of the new object in the selected keyframe
			var curKeyframeIndex = keyframeAt(animatePlayhead.ontick);
			var curKeyframe = keyframes[curKeyframeIndex];
			var curKeyframeObject;
			
			for (var i = 0; i < curKeyframe.objects.length; i++) {

				var currentObjectRef = getObjectByUUID(curKeyframe.objects[i].uuid);
				if (currentObjectRef !== undefined && currentObjectRef.userData.justAdded === true) {

					currentObjectRef.userData.justAdded = false; // Remove temporary marker

					curKeyframeObject = curKeyframe.objects[i];

				}

			}

			if (curKeyframeObject === undefined || settings.importing)
				return;

			for (var i = 0; i < keyframes.length; i++) {

				if (i !== curKeyframeIndex) {

					// Add the new object to all other keyframes (except for the one which was selected and was automatically updated)

					keyframes[i].objects[keyframes[i].objects.length] = {
	                    uuid: curKeyframeObject.uuid,
	                    position: {
	                        x: curKeyframeObject.position.x,
	                        y: curKeyframeObject.position.y,
	                        z: curKeyframeObject.position.z
	                    },
	                    rotation: {
	                        x: curKeyframeObject.rotation.x,
	                        y: curKeyframeObject.rotation.y,
	                        z: curKeyframeObject.rotation.z
	                    },
	                    customname: curKeyframeObject.customname,
	                    size: curKeyframeObject.size,
	                    visible: curKeyframeObject.visible,
	                    objref: curKeyframeObject.objref
	                } // Gets all of the values straight from the 'template';

				}

			}

		}, 1);
	},

	compile: function(args) {
		var seg = args.seg;
		var isItem = args.isItem;

		// If not adding to scene, it can return the array of segments right here
		if (!models.addToScene) {
			return seg;
		}

		var currentBlock = args.currentBlock;

		var obj = new THREE.Object3D();
		// Put all segments of the model together into a single object
		for (var c = 0; c < seg.length; c++) {
			obj.add(seg[c]);
		}

		// Give the object the default name
		obj.userData.name = 'Object ' + (objects.length + 1);

		if (!settings.dontSelect && !settings.importing)
		for (var c = 0; c < objects.length; c++)
			objects[c].userData.selected = false;
		obj.userData.selected = true;

		obj.userData.rawid = currentBlock;

		obj.userData.blockid = 'id:' + currentBlock.replace(/\:(\d+)/, ',Damage:$1');

		obj.userData.customname = randomString(5);

		var armorStandTip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color: 0x9933ff}));
		armorStandTip.userData.isRotationOffset = true;
		armorStandTip.position.y = -0.5 + (1.25 / 16);
		armorStandTip.userData.armorStandTip = true;
		armorStandTip.visible = false;

		if (isItem) {
			armorStandTip.userData.isItem = true;

			if (args.modelDisplay === undefined)
			{
				armorStandTip.position.y -= (12 / 16);
				armorStandTip.position.z += (7 / 16);
			}

			obj.userData.isItem = true;
		} else {
			obj.userData.isItem = false;
		}

		obj.userData.enableRotCenter = true;

		var parentobjY = new THREE.Object3D();

		var parentobjZ = new THREE.Object3D();

		var parentObjModel = new THREE.Object3D(); // Model object to hold both the segment container, and the rotation offset obj. This will also be the rotator for the X rotation now

		// Default block size when adding a new object
		obj.userData.size = 'medium';
		parentObjModel.scale.x = 0.4375;
		parentObjModel.scale.y = 0.4375;
		parentObjModel.scale.z = 0.4375;

		var parentObjTop = new THREE.Object3D(); // model object for translation
		parentObjTop.position.y = parentObjModel.scale.y / 2;

		// Set rotation point by moving all objects and using the main parent object (obj) as the pivot object
		// Instead of this, I made it rotate in a more user-friendly way, so it can do all of the calculations behind the scenes.

		// var moveForRot = obj.scale.y / 2;
		// for (var c = 0; c < obj.children.length; c++) {
		// 	obj.children[c].position.y += moveForRot;
		// }
		// obj.position.y -= moveForRot * obj.scale.y;

		obj.userData.isDynamic = true;

		// Visibility (can be changed by the user for each keyframe)

		obj.userData.visible = true;

		obj.userData.customnbt = ''; // No custom NBT initially (obviously)


		// Add object to object array and update the screen

		objects[objects.length] = obj;
		objectrotationwrappers[objectrotationwrappers.length] = parentobjY;
		rotationwrappersparent[rotationwrappersparent.length] = parentobjZ;

		parentObjModel.add(obj);
		parentobjY.add(parentObjModel);
		parentobjZ.add(parentobjY);
		parentObjTop.add(parentobjZ);

		parentObjModel.add(armorStandTip);

		// If adding to scene (when adding a new object), add the top level parent
		// parentobjZ.add(objectrotationwrappers[objectrotationwrappers.length-1]);
		// parentObjModel.add(parentobjZ);
		// parentObjTop.add(parentObjModel);
		// objectrotationwrappers[objectrotationwrappers.length-1].add(objects[objects.length-1]);

		if (!settings.importing && !settings.dontSelect)
			editObject(objects[objects.length-1]);
		window.requestAnimationFrame(render);

		// Set display if it is a custom model

		obj.userData.translation = {x: 0, y: 0, z: 0}; // Just in case there is no display specified

		if (args.modelDisplay !== undefined) {
			// Scale (applied to parent because a scale is already being applied to the object[])
			obj.scale.x = args.modelDisplay.scale.x;
			obj.scale.y = args.modelDisplay.scale.y;
			obj.scale.z = args.modelDisplay.scale.z;

			// Translation
			// parentObjModel.position.x += args.modelDisplay.translation.x / 16;
			// parentObjModel.position.y += args.modelDisplay.translation.y / 16;
			// parentObjModel.position.z += args.modelDisplay.translation.z / 16;

			// Save translation in userData
			obj.userData.translation = {};
			obj.position.x = args.modelDisplay.translation.x / 16;
			obj.position.y = args.modelDisplay.translation.y / 16;
			obj.position.z = args.modelDisplay.translation.z / 16;

			// Rotation
			obj.rotation.x = args.modelDisplay.rotation.x * (pi / 180);
			obj.rotation.y = args.modelDisplay.rotation.y * (pi / 180);
			obj.rotation.z = args.modelDisplay.rotation.z * (pi / 180);
			
		}

		if (args.currentBlock !== undefined && currentBlock.indexOf('_stairs') > -1)
		{
			// Specifically for stairs
			// Negate Y rotation
			obj.rotation.y *= -1;
		}

		// updateObjectTranslation(obj); // Initial update for translation

		setTimeout(function() {
			window.requestAnimationFrame(render);

			updateObjectBrowser();
		}, 500);

		return {topparent: parentObjTop, obj: obj};

		// Saving a reference to the rotationOffset object messed it up for some reason
		// for (var i = 0; i < obj.children.length; i++) {
		// 	if (obj.children[i].userData.isRotationOffset == true) {
		// 		obj.userData.rotationCenter = obj.children[i];
		// 	}
		// }
	},

	flattenObject: function(ob) {
		var toReturn = {};
		
		for (var i in ob) {
			if (!ob.hasOwnProperty(i)) continue;
			
			if ((typeof ob[i]) == 'object') {
				var flatObject = models.flattenObject(ob[i]);
				for (var x in flatObject) {
					if (!flatObject.hasOwnProperty(x)) continue;
					
					toReturn[i + '.' + x] = flatObject[x];
				}
			} else {
				toReturn[i] = ob[i];
			}
		}
		return toReturn;
	},

	tryLoadModelAccumulate: {textures: [], elements: []},

	resetModelAccumulate: function() {
		// Removes all elements and textures from the accumulated object
		models.tryLoadModelAccumulate = {textures: [], elements: []};
	},

	tryLoadModelJSON: function(parentName, blockName, retain, callback) {
		
		// Recursive parent json finder function

		// The blockName argument is no longer needed; -> UPDATE: Yes it is.

		var blockNameAuto = parentName.replace(/[a-zA-Z0-9_\/]+\//, '');

		if (models.customStorageJSON.models[blockNameAuto] !== undefined) {

			retain.isCustomModel = true;

			var data = models.customStorageJSON.models[blockNameAuto];

			if (typeof data == 'string') {
				data = JSON.parse(data)
			}

			// Below here is copied from the $.getJSON call from below vvv

			// Textures and elements that are carried over to the parent
			if (data.textures !== undefined) {

				models.tryLoadModelAccumulate.textures[models.tryLoadModelAccumulate.textures.length] = JSON.stringify(data.textures);

			}

			if (data.elements !== undefined) {

				for (var i = 0; i < data.elements.length; i++) {

					models.tryLoadModelAccumulate.elements[models.tryLoadModelAccumulate.elements.length] = JSON.stringify(data.elements[i]);

				}

			}


			if (data.parent !== undefined && data.parent !== 'block/block' && data.parent !== 'item/handheld_rod') {

				console.log('Discovered parent "' + data.parent + '"')

				// recursive
				models.tryLoadModelJSON(data.parent, blockName, retain, callback); // If there is a parent, move to it

			} else {

				// If there is not a parent, load this one
				if (typeof data == 'string') {

					models.loadJSON(data, blockName, retain, callback);

				} else {

					models.loadJSON(JSON.stringify(data), blockName, retain, callback);

				}

			}

			// Above here is copied from the $.getJSON call from below ^^^

		} else {

			$.getJSON('https://mrgarretto.com/armorstand/models/' + parentName + '.json', function(data) {

				if (models.customStorageJSON.models[parentName.replace('block/', '')] !== undefined) {

					retain.isCustomModel = true;

					data = JSON.parse(models.customStorageJSON.models[parentName.replace('block/', '')]);

				}

				if (data.textures !== undefined) {

					models.tryLoadModelAccumulate.textures[models.tryLoadModelAccumulate.textures.length] = JSON.stringify(data.textures);

				}

				if (data.elements !== undefined) {

					for (var i = 0; i < data.elements.length; i++) {

						models.tryLoadModelAccumulate.elements[models.tryLoadModelAccumulate.elements.length] = JSON.stringify(data.elements[i]);

					}

				}

				if (data.parent !== undefined && data.parent !== 'block/block') {

					models.tryLoadModelJSON(data.parent, blockName, retain, callback); // If there is a parent, move to it

				} else {

					// If there is not a parent, load this one
					if (typeof data == 'string') {

						models.loadJSON(data, blockName, retain, callback);

					} else {

						models.loadJSON(JSON.stringify(data), blockName, retain, callback);

					}

				}

			}).error(function() {

				if (typeof data == 'string') {

					models.loadJSON(data, blockName, retain, callback);

				} else {

					models.loadJSON(JSON.stringify(data), blockName, retain, callback);

				}
				
			});

		}

	},

	customStorageJSON: {
		blockstates: {},
		models: {},
		textures: {}
	},

	addToIndex: function(jsonString, fileName) {

		var tempJSON = JSON.parse(jsonString);
		
		if (tempJSON.variants !== undefined) {
			// Is a blockstates file

			// Add the custom blockstate json to the blockstates property of models.customStorageJSON under the key of the file name
			models.customStorageJSON.blockstates[fileName.replace('.json', '')] = jsonString;

		} else if (tempJSON.elements !== undefined || tempJSON.overrides !== undefined || tempJSON.parent !== undefined || tempJSON.display !== undefined) {
			// Is a model file

			// Add the custom model json to the models property of models.customStorageJSON under the key of the file name
			models.customStorageJSON.models[fileName.replace('.json', '')] = jsonString;

		} else {

			console.log("Could not find type of file below:");
			console.log(jsonString);

		}

	},

	createObj: function(blockName, retain, callback) {

		if (blockName.indexOf('armorstand_') > -1) {
			blockName = '#' + blockName;
		}

		var rawBlockName = blockName; // save it first before changing

		rawBlockName = rawBlockName.replace(' ', ':'); // convert both formats to colons

		// retain.displaySlot will be an integer for the preview slot on a blank armorstand, if the object about to be created is going to be one

		// Check if another object with this same id already exists in the scene
		// If it does, then duplicate that one instead of downloading the JSON again (makes it faster and doesn't impact internet speed as much)

		for (var i = 0; i < objects.length; i++) {

			if (objects[i].userData.rawid === rawBlockName && objects[i].parent.parent.parent.parent.userData.blankArmorstandPreviewSlot === undefined) {
				// A match has been found. Duplicate then activate callback

				var newObj = duplicateObject(objects[i]);

				newObj.parent.parent.parent.parent.position.set(0, newObj.parent.scale.y / 2, 0);
				newObj.parent.rotation.x = 0;
				newObj.parent.parent.rotation.y = 0;
				newObj.parent.parent.parent.rotation.z = 0;

				callback({

					retain: retain,
					obj: newObj,
					topparent: newObj.parent.parent.parent.parent

				});

				try
				{

					for (var j = 0; j < objects.length; j++)
						objects[j].userData.selected = false;

					newObj.userData.selected = true;

					if (!settings.importing)
						editObject(newObj);
				}
				catch(e)
				{
					console.log("Didn't select new duplicate object");
				}

				return;
			}

		}

		var blockNameWithoutDamage = blockName.replace(/:[0-9]+/, '');

		var isAnItem = false;

		if (blockIds[blockNameWithoutDamage] !== undefined) {
			// Is a key in blocknames
			if (blockIds[blockNameWithoutDamage].indexOf('*') >= 0) {
				// Is an item model
				// blockName = blockName.replace('*', '');
				// keeps the input text and gets the first half (before the colon) below here
				blockName = blockIds[blockNameWithoutDamage].replace('*', '');
				isAnItem = true;
			} else {
				blockName = blockIds[blockNameWithoutDamage];
			}
			
		} else if (blockIds[rawBlockName] !== undefined) {
			// Has a damage value

			if (blockIds[rawBlockName].indexOf('*') >= 0) {
				// Is an item model
				// blockName = blockName.replace('*', '');
				// keeps the input text and gets the first half (before the colon) below here
				blockName = blockIds[rawBlockName].replace('*', '');
				isAnItem = true;
			} else {
				blockName = blockIds[rawBlockName];
			}

		} else if (blockIds[blockNameWithoutDamage + ':0'] !== undefined) {

			if (blockIds[blockNameWithoutDamage + ':0'].indexOf('*') >= 0) {
				// Is an item model
				// blockName = blockName.replace('*', '');
				// keeps the input text and gets the first half (before the colon) below here
				blockName = blockIds[blockNameWithoutDamage + ':0'].replace('*', '');
				isAnItem = true;
			} else {
				blockName = blockIds[blockNameWithoutDamage + ':0'];
			}

		} else {

			if ($.inArray(blockNameWithoutDamage, blockIds) === -1) {
				// Second to last chance to look for valid block in blockids values ^
				
				MessageBox.red('Invalid block<br><div id="report-blockid-error">Click here if you believe this is an error!</div>');

				console.log('Invalid block: ' + blockNameWithoutDamage);

	            // Report block ID error
	            $('#report-blockid-error').click(function() {

	            	$.post('php/missingid.php', {

	            		blockid: $('#createblock-text').val()

	            	}, function(data) {

	            		$('.messagebox').fadeOut(100);

	            		MessageBox.green('The id, ' + $('#createblock-text').val() + ', has now been reported as missing!');

	            	});

	            });

	            callback({success: false, retain: retain});

				return;

			}

		}

		var damage = 0;

		if (rawBlockName.indexOf(':') >= 0) {

			damage = parseInt(rawBlockName.split(':')[1]); // damage will become the number after the colon in rawBlockName
			blockName = blockName.split(':')[0];

		} else {

			damage = 0; // if not specified, damage will be 0

		}

		if (isAnItem) {
			// Is an item

			var maxDurability = getMaxDurability(blockName);

			
			// if (blockName === '')

			if (models.customStorageJSON.models[blockName] !== undefined) {
				// There is a custom model for this item that was part of a user-uploaded resource pack

				var dataString = models.customStorageJSON.models[blockName];

				var data = JSON.parse(dataString);

				// This runs for both scenarios above

				// var blockStateJSON = data;

				var baseName = data.parent;

				if (baseName === undefined) {
					// No parent property; that means that this is probably a model file. Now load it

					models.tryLoadModelAccumulate = {
						textures: [],
						elements: []
					}; // Clear the accumulate variable (which holds the textures, etc..)

					retain.isCustomModel = true;

					models.loadJSON(dataString, blockName, retain, callback); // Load the model directly, since it is actually a model file

					return;
				}

				if (data.overrides !== undefined) {
					// Is a bunch of different models for each damage value. Don't load parent (may change in the future)

					for (var i = 0; i < data.overrides.length; i++) {

						if (data.overrides[i].predicate !== undefined) {

							var overridesObject = data.overrides[i]; // This will run on every 'predicate' key of every element in the overrides property of an item model

							if (Math.ceil(overridesObject.predicate.damage * maxDurability) === damage) {
								// If the current-looped predicate matches the damage that the user entered when adding the new object

								var currentReference = overridesObject.model;
								var currentName = overridesObject.model.replace('item/', '').replace('block/', '');

								console.log('Found predicate "' + currentReference + '"');

								if (blockIds[overridesObject.model.replace('item/', '').replace('block/', '')] !== undefined) {
									// The model specified in the correct predicate for this damage is a default model, and it will load it here

									if (blockIds[overridesObject.model.replace('item/', '')].indexOf('*') >= 0) {
										// An item model was referenced

										models.insert.item([overridesObject.model.replace('item/', '')], function(data) {
											data.currentBlock = rawBlockName;
											var returnVal = models.compile(data);
											returnVal.retain = retain;
											callback(returnVal);
											if (!retain.dontCreateKeyframe)
												models.updateKeyframesAfterAddObj();
										});

										return;

									} else {
										// A block model was referenced

										models.tryLoadModelAccumulate = {
											textures: [],
											elements: []
										}; // Clear the accumulate variable (which holds the textures, etc..)

										models.tryLoadModelJSON(currentReference, rawBlockName, retain, callback);
										return;

									}

									break;

								} else {
									// The model specified is not a default model. It will do the normal procedure for this here

									models.tryLoadModelAccumulate = {
										textures: [],
										elements: []
									}; // Clear the accumulate variable (which holds the textures, etc..)

									models.tryLoadModelJSON(currentReference, rawBlockName, retain, callback);

								}

							}

						}

					}

				} else {
					// Has a parent reference and no overrides list. Attempt to load the parent (also may change in the future)

					models.tryLoadModelAccumulate = {
						textures: [],
						elements: []
					}; // Clear the accumulate variable (which holds the textures, etc..)

					models.tryLoadModelJSON(baseName, rawBlockName, retain, callback);

				}

			} else {

				// Using the default item model

				models.insert.item([blockName], function(data) {
					data.currentBlock = rawBlockName;
					var returnVal = models.compile(data);
					returnVal.retain = retain;
					callback(returnVal);
					if (!retain.dontCreateKeyframe)
						models.updateKeyframesAfterAddObj();
				});

			}

			return;

			// if (models.customStorageJSON.models[blockName].overrides !== undefined) {
			// 		// Special

			// 		for (var predicate in models.customStorageJSON.models[blockName].overrides) {
		}

		// Will only get to here if it is not an item

		$.getJSON('https://mrgarretto.com/armorstand/blockstates/' + blockName + '.json', function(data) {

			// Found the blockstates file

			models.createObjPart2({

				blockName: blockName,
				rawBlockName: rawBlockName,
				retain: retain,
				callback: callback,
				data: data

			});

		}).error(function() {

			// Couldn't find blockstate file - look for model file

			$.getJSON('https://mrgarretto.com/armorstand/models/block/' + blockName + '.json', function(data) {

				models.createObjPart2({

					blockName: blockName,
					rawBlockName: rawBlockName,
					retain: retain,
					callback: callback,
					data: data

				});
			});

		});

	},

	createObjPart2: function(args) {

		var blockName = args.blockName;
		var rawBlockName = args.rawBlockName;
		var retain = args.retain;
		var callback = args.callback
		var data = args.data;

		if (models.customStorageJSON.blockstates[blockName] !== undefined) {
			// If a custom blockstate json file is in the customStorageJSON for this block, overwrite the data here

			data = JSON.parse(models.customStorageJSON.blockstates[blockName]);

		}

		if (models.customStorageJSON.models[blockName] !== undefined) {
			// If a custom model json file is in the customStorageJSON for this block, then skip the blockstate part and jump straight to the model loading

			models.tryLoadModelAccumulate = {
				textures: [],
				elements: []
			}; // Clear the accumulate variable (which holds the textures, etc..)

			retain.isCustomModel = true;


			// Doesn't need to check for damage 'blockstate'-type file (which is actually a model file) because blocks don't have durability damage
			models.tryLoadModelJSON('block/' + blockName, rawBlockName, retain, callback);

			return;

		}

		var blockStateJSON = data;

		var flattenedBlockState = models.flattenObject(blockStateJSON);

		var baseName = '';

		var seconds = ['fence', 'spruce_fence', 'birch_fence', 'jungle_fence', 'dark_oak_fence', 'acacia_fence', 'nether_brick_fence', 'stone_stairs'];

		if ($.inArray(blockName, seconds) !== -1) {
			// Get second model since it is a weird one

			var curName = blockName;

			if (curName === 'fence') {
				curName = 'oak_fence';
			}

			baseName = 'item/' + curName;

		} else {
			// Normal blockstate file

			// Get value of first model property in the blockstates file
			for (prop in flattenedBlockState) {
				if (prop.indexOf('.model') > -1) {
					baseName = 'block/' + flattenedBlockState[prop];
					break;
				}
			}

		}

		

		models.tryLoadModelAccumulate = {
			textures: [],
			elements: []
		}; // Clear the accumulate variable (which holds the textures, etc..)

		models.tryLoadModelJSON(baseName, rawBlockName, retain, callback);
	},

	pixelated: function(texture) {
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		return texture;
	},

	calDown: function(height) {
		// Calculates the amount that should be subtracted from
		// an object's position.y based on its height so that it is bottom-to-floor
		return -(1 - height) / 2;
	},

	texFaces: function(args) {
		// args = {north: {path: "texturepath"}, etc...}

		var texturenames = [];

		var placeHolder = 'blocks/bedrock';

		// Check the order here too
		
		if (args.west !== undefined) {
			texturenames[texturenames.length] = args.west.path;
		} else {
			texturenames[texturenames.length] = placeHolder;
		}
		
		if (args.east !== undefined) {
			texturenames[texturenames.length] = args.east.path;
		} else {
			texturenames[texturenames.length] = placeHolder;
		}
		
		if (args.up !== undefined) {
			texturenames[texturenames.length] = args.up.path;
		} else {
			texturenames[texturenames.length] = placeHolder;
		}

		if (args.down !== undefined) {
			texturenames[texturenames.length] = args.down.path;
		} else {
			texturenames[texturenames.length] = placeHolder;
		}

		if (args.north !== undefined) {
			texturenames[texturenames.length] = args.north.path;
		} else {
			texturenames[texturenames.length] = placeHolder;
		}

		if (args.south !== undefined) {
			texturenames[texturenames.length] = args.south.path;
		} else {
			texturenames[texturenames.length] = placeHolder;
		}
		

		textures = [];

		for (i = 0; i < 6; i++) {

			// First, check if the specified textures exists in the custom texture storage
			if (models.customStorageJSON.textures[texturenames[i]] !== undefined) {

				var curTexture = new THREE.Texture();
				curTexture.image = models.customStorageJSON.textures[texturenames[i]].image;
				curTexture.needsUpdate = true;

				curTexture.onUpdate = function() {
					render();
				};

				textures[textures.length] = new THREE.MeshLambertMaterial({map: models.pixelated(curTexture), transparent: true, alphaTest: 0.5});

			} else {
				// If not, then load it from the default textures

				var curTextureLoader = new THREE.TextureLoader();

				var curTexture = curTextureLoader.load('textures/' + texturenames[i] + '.png');

				curTextureLoader.manager.onLoad = function() {
					curTextureLoader.needsUpdate = true;
					render();
				};

				textures[textures.length] = new THREE.MeshLambertMaterial({map: models.pixelated(curTexture), transparent: true, alphaTest: 0.5});
			}
			
		}

		return textures; // This texture array will be used in a MeshFaceMaterial

	},

	testImage: function(url, callback, timeout) {
	    timeout = timeout || 5000;
	    var timedOut = false, timer;
	    var img = new Image();
	    img.onerror = img.onabort = function() {
	        if (!timedOut) {
	            clearTimeout(timer);
	            callback(url, "error");
	        }
	    };
	    img.onload = function() {
	        if (!timedOut) {
	            clearTimeout(timer);
	            callback(url, "success");
	        }
	    };
	    img.src = url;
	    timer = setTimeout(function() {
	        timedOut = true;
	        callback(url, "timeout");
	    }, timeout); 
	},

	insert: {
		
		item: function(texturenames, fn) {
			// Textures = [item]  syntax = 1
			// fn = function to run when the onLoadFunction is finally done. This function will have the data return object sent as an argument

			// Load the texture and keep the item's thickness

			// Check if the texture exists in the items folder. If not, then load it from the blocks folder

			var plaintexturename = texturenames[0].replace(/[a-zA-Z0-9_]+\//, '');

			var itemtexturepath = 'https://mrgarretto.com/armorstand/textures/items/' + plaintexturename + '.png';

			models.testImage(itemtexturepath, function(url, result) {

				if (result === 'error') {
					itemtexturepath = 'https://mrgarretto.com/armorstand/textures/blocks/' + plaintexturename + '.png'; // Change it to the block texture path if the item one didn't exist
				}

				var imageObj = new Image();
				var onloadFunction = imageObj.onload = function() {

					$.getJSON('https://mrgarretto.com/armorstand/models/item/' + plaintexturename + '.json', function(itemModelData) {
						// Get the item model file too, so that if it has any custom displays on the head, it can be applied

						// Model display on head

						var display;

						if (itemModelData.display !== undefined && itemModelData.display.head !== undefined) {
							display = {
								rotation: {
									x: -itemModelData.display.head.rotation[0],
									y: itemModelData.display.head.rotation[1],
									z: itemModelData.display.head.rotation[2]
								},
								translation: {
									x: -itemModelData.display.head.translation[0],
									y: itemModelData.display.head.translation[1],
									z: -itemModelData.display.head.translation[2]
								},
								scale: {
									x: itemModelData.display.head.scale[0],
									y: itemModelData.display.head.scale[1],
									z: itemModelData.display.head.scale[2]
								}
							}
						} else {

							// No custom display is defined in the model file for this item - Use the default one
							display = undefined

						}


						// The rest of the item texture loading

						itemLoaderCtx.clearRect(0,0,16,16);
						itemLoaderCtx.drawImage(imageObj, 0, 0);

						var imgData = itemLoaderCtx.getImageData(0, 0, 16, 16);

						// imgData.data[] is an array containing every pixel's RGBA.
						// imgData.data[0] is the first pixel's RED
						// imgData.data[1] is the first pixel's GREEN
						// imgData.data[2] is the first pixel's BLUE
						// imgData.data[3] is the first pixel's APLHA

						var segments = [];
						var itemPixelSize = 1 / 16;
						var pixelX, pixelY, pixelColor;

						for (var i = 0; i < imgData.data.length; i += 4) {
							if (imgData.data[i+3] > 0) {

								pixelY = imgData.height - Math.floor((i / 4) / imgData.width);
								pixelX = (i / 4) % imgData.width;

								pixelColor = new THREE.Color("rgb(" + imgData.data[i] + ", " + imgData.data[i+1] + ", " + imgData.data[i+2] + ")");

								segments[segments.length] = new THREE.Mesh(new THREE.BoxGeometry(itemPixelSize, itemPixelSize, itemPixelSize), new THREE.MeshPhongMaterial({color: pixelColor}));
								segments[segments.length-1].userData.color = pixelColor;

								segments[segments.length-1].userData.rgb = {
									r: imgData.data[i],
									g: imgData.data[i+1],
									b: imgData.data[i+2]
								};

								if (display !== undefined && display.translation !== undefined)
								{
									// Dont include offset here

									segments[segments.length-1].position.x = ((-((itemPixelSize * 16) / 2)) + (itemPixelSize / 2)) + (pixelX * itemPixelSize);
									segments[segments.length-1].position.y = (((-((itemPixelSize * 16) / 2)) + (itemPixelSize / 2)) + (pixelY * itemPixelSize));
									segments[segments.length-1].position.z = 0;
								} else {
									// Include the offset here

									segments[segments.length-1].position.x = ((-((itemPixelSize * 16) / 2)) + (itemPixelSize / 2)) + (pixelX * itemPixelSize);
									segments[segments.length-1].position.y = (((-((itemPixelSize * 16) / 2)) + (itemPixelSize / 2)) + (pixelY * itemPixelSize));
									segments[segments.length-1].position.z = 0;

								}

								
							}
						}

						fn({seg: segments, isItem: true, modelDisplay: display}); // Return data to the specified function

					}).error(function() {

						var display = undefined;


						// The rest of the item texture loading

						itemLoaderCtx.clearRect(0,0,16,16);
						itemLoaderCtx.drawImage(imageObj, 0, 0);

						var imgData = itemLoaderCtx.getImageData(0, 0, 16, 16);

						// imgData.data[] is an array containing every pixel's RGBA.
						// imgData.data[0] is the first pixel's RED
						// imgData.data[1] is the first pixel's GREEN
						// imgData.data[2] is the first pixel's BLUE
						// imgData.data[3] is the first pixel's APLHA

						var segments = [];
						var itemPixelSize = 1 / 16;
						var pixelX, pixelY, pixelColor;

						for (var i = 0; i < imgData.data.length; i += 4) {
							if (imgData.data[i+3] > 0) {

								pixelY = imgData.height - Math.floor((i / 4) / imgData.width);
								pixelX = (i / 4) % imgData.width;

								pixelColor = new THREE.Color("rgb(" + imgData.data[i] + ", " + imgData.data[i+1] + ", " + imgData.data[i+2] + ")");

								segments[segments.length] = new THREE.Mesh(new THREE.BoxGeometry(itemPixelSize, itemPixelSize, itemPixelSize), new THREE.MeshPhongMaterial({color: pixelColor}));
								segments[segments.length-1].userData.color = pixelColor;

								segments[segments.length-1].userData.rgb = {
									r: imgData.data[i],
									g: imgData.data[i+1],
									b: imgData.data[i+2]
								};

								if (display !== undefined && display.translation !== undefined)
								{
									// Dont include offset here

									segments[segments.length-1].position.x = ((-((itemPixelSize * 16) / 2)) + (itemPixelSize / 2)) + (pixelX * itemPixelSize);
									segments[segments.length-1].position.y = (((-((itemPixelSize * 16) / 2)) + (itemPixelSize / 2)) + (pixelY * itemPixelSize));
									segments[segments.length-1].position.z = 0;
								} else {
									// Include the offset here

									segments[segments.length-1].position.x = ((-((itemPixelSize * 16) / 2)) + (itemPixelSize / 2)) + (pixelX * itemPixelSize);
									segments[segments.length-1].position.y = (((-((itemPixelSize * 16) / 2)) + (itemPixelSize / 2)) + (pixelY * itemPixelSize));
									segments[segments.length-1].position.z = 0;

								}

								
							}
						}

						fn({seg: segments, isItem: true, modelDisplay: display}); // Return data to the specified function


					});

				};


				imageObj.src = itemtexturepath;

				// Will not return anything here, because it will get the data at the onloadFunction

				// End of the special item texture loading process

				// var textures = models.texFace(texturenames, 1, true);
				// var segments = [];
				// var amountToMake = 10;

				// for (var i = 0; i < amountToMake; i++) {
				// 	// Change the following line so that the size of the BoxGeometry matches
				// 	// the size that the items are on armor stands' heads in game
				// 	segments[i] = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0), new THREE.MeshFaceMaterial(textures));
				// 	segments[i].position.z = (-0.1) + ((i / amountToMake) * 0.2);
				// }

				// models.compile(segments);

			});
		},

		blankArmorstand: function(callback) {

			var segments = [];

			// Make it load all of the armorstand parts through the JSON loader function, then give them offsets so that they are rotated by the ends and not the center
			// Then, make it so that the player cannot change their positions, but only their rotations. Since they are normal objects, the interpolation will work automatically!


			// Neck
			settings.dontSelect = true; // This prevents it from selecting each object after adding them

			models.resetModelAccumulate();

			models.tryLoadModelJSON('block/armorstand_neck', 'armorstand_neck', {callback: callback}, function(callbackData) {
				console.log('Armorstand neck loaded');
				var armorstandParts = {
					neck: callbackData.topparent,
					torso: null,
					arm1: null,
					arm2: null,
					leg1: null,
					leg2: null
				}
				models.resetModelAccumulate();

				// Arm 1
				models.tryLoadModelJSON('block/armorstand_arm', 'armorstand_arm', {armorstandParts: armorstandParts, callback: callbackData.retain.callback}, function(callbackData) {
					console.log('Armorstand arm 1 loaded');
					var armorstandParts = callbackData.retain.armorstandParts;
					armorstandParts.arm1 = callbackData.topparent;
					models.resetModelAccumulate();

					// Arm 2
					models.tryLoadModelJSON('block/armorstand_arm', 'armorstand_arm', {armorstandParts: armorstandParts, callback: callbackData.retain.callback}, function(callbackData) {
						console.log('Armorstand arm 2 loaded');
						var armorstandParts = callbackData.retain.armorstandParts;
						armorstandParts.arm2 = callbackData.topparent;
						models.resetModelAccumulate();

						// Leg 1
						models.tryLoadModelJSON('block/armorstand_leg', 'armorstand_leg', {armorstandParts: armorstandParts, callback: callbackData.retain.callback}, function(callbackData) {
							console.log('Armorstand leg 1 loaded');
							var armorstandParts = callbackData.retain.armorstandParts;
							armorstandParts.leg1 = callbackData.topparent;
							models.resetModelAccumulate();

							// Leg 2
							models.tryLoadModelJSON('block/armorstand_leg', 'armorstand_leg', {armorstandParts: armorstandParts, callback: callbackData.retain.callback}, function(callbackData) {
								console.log('Armorstand leg 2 loaded');
								var armorstandParts = callbackData.retain.armorstandParts;
								armorstandParts.leg2 = callbackData.topparent;
								models.resetModelAccumulate();

								// Torso
								models.tryLoadModelJSON('block/armorstand_torso', 'armorstand_torso', {armorstandParts: armorstandParts, callback: callbackData.retain.callback}, function(callbackData) {
									console.log('Armorstand torso loaded');
									var armorstandParts = callbackData.retain.armorstandParts;
									armorstandParts.torso = callbackData.topparent;
									models.resetModelAccumulate();

									// When done (this should always be in the last loaded callback)

									// Armorstand parts rotational offsets to make the joints move like an actual armorstand

									armorstandParts.neck.position.y = 0.3865;
									armorstandParts.neck.children[0].children[0].children[0].children[0].position.y = 0.25;

									armorstandParts.torso.position.y = 0.41406;
									armorstandParts.torso.children[0].children[0].children[0].children[0].position.y = -0.375;

									armorstandParts.arm1.position.y = 0.36;
									armorstandParts.arm1.children[0].children[0].children[0].children[0].position.y = -0.25;
									armorstandParts.arm1.position.x = -0.164;

									armorstandParts.arm2.position.y = 0.36;
									armorstandParts.arm2.children[0].children[0].children[0].children[0].position.y = -0.25;
									armorstandParts.arm2.position.x = 0.164;

									armorstandParts.leg1.position.y = 0.086;
									armorstandParts.leg1.children[0].children[0].children[0].children[0].position.y = -0.34375;
									armorstandParts.leg1.position.x = -0.0548;

									armorstandParts.leg2.position.y = 0.086;
									armorstandParts.leg2.children[0].children[0].children[0].children[0].position.y = -0.34375;
									armorstandParts.leg2.position.x = 0.0548;

									armorstandContainer = new THREE.Object3D();

									for (var key in armorstandParts) {
										armorstandParts[key].position.y += 0.21875;

										armorstandParts[key].userData.blankArmorstandPart = true;
										armorstandParts[key].userData.justAdded = true;

										armorstandContainer.add(armorstandParts[key]);
									}

									armorstandContainer.scale.set(2.37, 2.37, 2.37);

									blankArmorstands[blankArmorstands.length] = armorstandContainer;

									// Armorstand NBT

									armorstandContainer.userData.nbt = {
										Invisible: false,
										ShowArms: true,
										Small: false,
										Invulnerable: false,
										NoBasePlate: true,
										NoGravity: true,
										PersistenceRequired: false,
										ArmorItems: ['{}', '{}', '{}', '{}'],
										HandItems: ['{}', '{}'],
										CustomName: randomString(5)
									}

									// End of armorstand NBT

									sceneWrapper.add(armorstandContainer);

									window.setTimeout(function() {
										settings.dontSelect = false;
									}, 2);

									for (var o = 0; o < objects.length; o++) {
					                    if (objects[o].userData.selected) {
					                        objects[o].userData.selected = false;
					                    }
					                }

					                models.updateKeyframesAfterAddObj();

					                if (callbackData.retain.callback !== undefined) {
					                	callback(armorstandContainer);
					                }
									
								});
							});
						});
					});
				});
			});

		}

	}
}