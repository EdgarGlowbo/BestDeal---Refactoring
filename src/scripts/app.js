// Queries
// Buy mats interface
const matPrice = document.querySelector(".o-input-price");
const matQuantity = document.querySelector(".o-input-quantity");
const submitMaterialsForm = document.querySelector(".m-main-ui__form");
const dropdownListDisplay = document.querySelector(".o-form__dropdown-list");
const materialList = document.querySelector('.o-materials__list');
const materialListText = document.querySelector('.o-materials__span');
// Available crafts window
const displayCrafts = document.querySelector(".m-crafts");
// Inventory window
const inventoryMainUI = document.querySelector('.m-main-ui__inventory');
const undoButton = document.querySelector('.c-header__undo-button');

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc,
  setDoc, getDocs, getDoc
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAwbXDnZoHAB38mEB62KlUKJDCA2HncwLU",
  authDomain: "bestdeal-3e2e2.firebaseapp.com",
  projectId: "bestdeal-3e2e2",
  storageBucket: "bestdeal-3e2e2.appspot.com",
  messagingSenderId: "621719322823",
  appId: "1:621719322823:web:a79db354bc754e3b5d3ee2"
};

initializeApp(firebaseConfig);

const db = getFirestore();

// Selected (profile) for collectionReference
const selectedProfile = 'huntail';

// materials collection reference
const matsColRef = collection(db, 'users', selectedProfile, 'materials');
const itemsColRef = collection(db, 'users', selectedProfile, 'items');

// Stores the id of the material selected in a mouse event
let selectedMat = 'eternalFire';
//Stores constructed objects
const constructedObjects = [];

const todbMatsinfo = () => {
  // <<Saves data>>
  // Gets matsInfo keys
  const docIDs = Object.keys(matsInfo);
  // Sets documents for each key in matsInfo in materials collection
  docIDs.forEach(id => {
    const docRef = doc(db, 'users', selectedProfile, 'materials', id);
    setDoc(docRef, matsInfo[id]);
  });
}

const todbConstructedObjs = (id, item) => {
  // <<Saves data>>  
  const docRef = doc(db, 'users', selectedProfile, 'items', id);
  // Sets to db a class instance (custom object). Solves compatibility problem by converting it to a JSON object
  setDoc(docRef, JSON.parse(JSON.stringify(item)));
}
// Submit prices and quantity of materials 
const buyMaterials = (priceInput, quantityInput, material) => {
  // Checks for existence of inventory on matsInfo if quantity is 0 then price and quantity should be equal to the input
  if (matsInfo[material].quantity === 0) {
    matsInfo[material].price = priceInput;
    matsInfo[material].quantity = quantityInput;
  } else {
    const average = matsInfo[material].price;
    const inBag = matsInfo[material].quantity;

    const newAverage =  ((average * inBag) + (priceInput * quantityInput)) / (inBag + quantityInput);
    matsInfo[material].price = Math.round(newAverage);
    matsInfo[material].quantity += Math.round(parseInt(quantityInput));
  }

  // Saves matsInfo object to db
  todbMatsinfo();
  // localStorage.setItem('materials', JSON.stringify(matsInfo));
  
};

// Show available crafts
class AvailableCrafts {
  cost = 0;
  constructor(name, recipe) {
    this.name = name;    
    this.recipe = JSON.parse(recipe);
  }
  calcCraftCost() {
    let calculatedCost = 0;
    Object.keys(this.recipe).forEach(material => {
      calculatedCost += this.recipe[material] * matsInfo[material].price;
    });
    this.cost = calculatedCost;
    return this;
  }
  craftItem(quantityInput) {
    Object.keys(this.recipe).forEach(material => {
      matsInfo[material].quantity -= (this.recipe[material] * quantityInput)      
    });
    // <<Saves data>> matsInfo to db
    todbMatsinfo();
    return this;
  }
  renderCrafts(i) {
    matCost[i].textContent = Math.round(this.cost).toString();
  }
  enoughItems(i) {    
    itemsToCraft[i].parentElement.classList.add('o-crafts__item--available');
    Object.keys(this.recipe).forEach(mat => {      
      
      if (matsInfo[mat].quantity < this.recipe[mat]) {
        itemsToCraft[i].parentElement.classList.remove('o-crafts__item--available');            
        itemsToCraft[i].parentElement.classList.add('o-crafts__item--unavailable');      
      }       
    });
  }   
}

// Class inherits from AvailableCrafts 
class AvailableEpics extends AvailableCrafts {
  profit = 0;
  inSaleStatus = false;
  price = 0;
  calcProfit(target) {
    this.profit = Math.round((this.price * 0.95) - this.cost);
    // itemsToCraft (form) children nodes to update span element
    target.textContent = this.profit.toString();
    return this;
  }
  inSale(target, objIndex) {
    // If inSaleStatus is true then set it to false and calls two functions to update the status of the targeted item also setitem to localstorage
    if (this.inSaleStatus) {          
      this
        .calcCraftCost(objIndex)
        .renderEpics(objIndex)
        .inSaleStatus = false;
      target[3].classList.remove('o-crafts__btn--in-sale');  
    } else {
      // Calls craftItem and inSale methods. 
      this.inSaleStatus = true;      
      target[3].classList.add('o-crafts__btn--in-sale');      
    }
    // <<Saves data>>    
    todbConstructedObjs(target[1].id, constructedObjects[objIndex]);      
    mementoSave();
  } 
  renderEpics(i) {
    craftPriceInput[i].value = Math.round(this.price).toString();
    craftCostInput[i].value = Math.round(this.cost).toString();
    return this;
  }
}

const startApp = () => {  
  // Only executes in epics pages
  if (typeof materialsRecipe === 'undefined') {
    const epicCrafts = Object.keys(itemsPerRecipe);    
    let i = 0;    
    epicCrafts.forEach(item => {
      
      // Get name and recipe properties from itemsPerRecipe object
      const itemName = itemsPerRecipe[item]['name'];
      const itemRecipe = JSON.stringify(itemsPerRecipe[item]['recipe']);
      // Pushes to constructedObject arr object instances created with name and recipe properties
      constructedObjects.push(new AvailableEpics(itemName, itemRecipe));         
      displayCrafts.innerHTML += `
      <div class="o-crafts__item">
        <h3 class="o-crafts__title o-crafts__item-name o-text o-text-title">${constructedObjects[i].name}</h3>
        <form class="o-crafts__interface">              
          <input type="text" class="o-crafts__input o-crafts__price o-input" value="${constructedObjects[i].price}" placeholder="$">
          <input type="text" class="o-crafts__input o-crafts__cost o-input" id="${epicCrafts[i]}" value="${constructedObjects[i].cost}">
          <span class="o-crafts__text o-crafts__profit o-text-span">${constructedObjects[i].profit}</span>
          <button type="submit" class="o-crafts__btn o-btn">In Sale</button>
        </form>
      </div>
    `;
      i++       
    });
    i = 0; 
    epicCrafts.forEach(async id => {
      const itemDocRef = doc(db, 'users', selectedProfile, 'items', id);
      const response = await getDoc(itemDocRef);
      constructedObjects[i].price = response.data().price;
      constructedObjects[i].cost = response.data().cost;
      constructedObjects[i].profit = response.data().profit;
      constructedObjects[i].inSaleStatus = response.data().inSaleStatus;             
      updateApp(i);
      i++;

    });
  } else {    
    const matCrafts = Object.keys(materialsRecipe);
    
    matCrafts.forEach(item => {
      const itemName = materialsRecipe[item]["name"];
      const itemRecipe = JSON.stringify(materialsRecipe[item]["recipe"]);
      constructedObjects.push(new AvailableCrafts(itemName, itemRecipe));
    });
      
    for (let i = 0; i < matCrafts.length; i++) {
      displayCrafts.innerHTML += `
      <div class="o-crafts__item">
        <h3 class="o-crafts__title o-crafts__item-name o-text o-text-title">${constructedObjects[i].name}</h3>
        <form class="o-crafts__interface">
          <span class="o-crafts__text o-crafts__item-cost o-text o-text-span" id="${matCrafts[i]}">${constructedObjects[i].cost}</span>
          <span class="o-crafts__text o-text o-text-span">x</span>
          <input type="text" class="o-crafts__input o-crafts__quantity o-input">
          <button type="submit" class="o-crafts__btn o-btn">Craft</button>
        </form>
      </div>
      `;
    }
  }
};
// Renders the name from the materials in materialList ul, 
// gets the id of the li elements to access matsInfo properties
const startInventory = async () => {    
  for (let i = 0; i < materialList.children.length; i++) {
    const matName = materialList.children[i].textContent;
    const matId = materialList.children[i].id;
    inventoryMainUI.innerHTML += `
    <div class="o-inventory__item" id="${matId}">
      <span class="o-inventory__item-name o-text-span">${matName}</span>
      <span class="o-inventory__item-amount o-text-span">${matsInfo[matId].quantity}</span>
      <span class="o-inventory__item-price o-text-span o-text-span--color">$${matsInfo[matId].price}</span>
      <button class="o-inventory__item-reset o-btn">Reset</button>
    </div>
    `;                  
  }  
  const response = await getDocs(matsColRef);
  response.forEach(doc => {
    matsInfo[doc.id] = doc.data();
  });
  updateInventory();
}
startInventory();
startApp();


// Mat cost text span query
const matCost = document.querySelectorAll(".o-crafts__item-cost");
const craftCostInput = document.querySelectorAll(".o-crafts__cost");
const craftPriceInput = document.querySelectorAll(".o-crafts__price");
const craftButtons = document.querySelectorAll(".o-crafts__btn");
// Each item form query
const itemsToCraft = document.querySelectorAll('.o-crafts__interface');
// Query to each inventory item
const inventoryItem = document.querySelectorAll('.o-inventory__item');


const updateApp = (i) => {  
  // Only executes in materials page
  if (typeof materialsRecipe !== "undefined") {
    constructedObjects[i].calcCraftCost(i);
    constructedObjects[i].renderCrafts(i);
    constructedObjects[i].enoughItems(i);
    
  } else {
    const epicCrafts = Object.keys(itemsPerRecipe);
    if (!constructedObjects[i].inSaleStatus) {
      // Sets cost to input field
      constructedObjects[i].calcCraftCost(i);
      // Sets price to input field
      constructedObjects[i].renderEpics(i);
      craftButtons[i].classList.remove('o-crafts__btn--in-sale');                   
    } else {
      constructedObjects[i].renderEpics(i);      
      craftButtons[i].classList.add('o-crafts__btn--in-sale');      
    }
    if (constructedObjects[i].price !== 0) {
      // Sets profit to input field
      constructedObjects[i].calcProfit(itemsToCraft[i].children[2]);
    } 
    constructedObjects[i].enoughItems(i);
    // <<Saves data>>      
    todbConstructedObjs(epicCrafts[i], constructedObjects[i]);
  }    
}

const updateInventory = () => {  
  inventoryItem.forEach(item => {
    const itemChildren = item.children;
    const matId = item.id;  
    itemChildren[1].textContent = matsInfo[matId].quantity.toString();    
    itemChildren[2].textContent = '$' + matsInfo[matId].price.toString();    
  });
};

// Stores snapshots every event that modifies an stored object
const mementos = [];

const mementoSave = () => {
  // Array stores the objects that make an snapshot
  const mementoSnapshot = [
    JSON.stringify(matsInfo)
  ];
  // Pushes each object in constructedObject to itemsMemento array
  const itemsMemento = [];
  constructedObjects.forEach(item => {
    const itemsStatus = JSON.stringify(item);
    itemsMemento.push(itemsStatus);
  });
  // Pushes itemsMemento to mementoSnapshot
  mementoSnapshot.push(itemsMemento);
  mementos.push(mementoSnapshot);
}

// Listens for submit events in top form
submitMaterialsForm.addEventListener('submit', e => {
  e.preventDefault();
  const price = parseInt(matPrice.value);
  const quantity = parseInt(matQuantity.value);
  
  if (!isNaN(price) && !isNaN(quantity)) {
    buyMaterials(price, quantity, selectedMat);
    // Updates objects values each submit event 
    updateInventory();        
    for (let i = 0; i < constructedObjects.length; i++) {
      updateApp(i);    
    }
    mementoSave();
  }
  submitMaterialsForm.reset();
});
// Updates selectedMat value with the value selected in the dropdown list
dropdownListDisplay.addEventListener('click', e => {
  // Removes display none class
  if (e.target === dropdownListDisplay || e.target === dropdownListDisplay.children[0]) {
    dropdownListDisplay.children[1].classList.toggle('o-materials__list--display-none');    
  } else {
    selectedMat = e.target.id;
    // Gets textContent of an html element acceded by id
    const selectedMatHTMLElement = document.getElementById(selectedMat).textContent;    
    materialListText.textContent = selectedMatHTMLElement;
    dropdownListDisplay.children[1].classList.toggle('o-materials__list--display-none');
  }
});


itemsToCraft.forEach(form => {

  form.addEventListener('submit', e => {  
    e.preventDefault();
    const formChildren = e.target.children;
    const objIndex = Array.prototype.slice.call(itemsToCraft).indexOf(e.target);
    if (typeof materialsRecipe !== 'undefined') {
      
      buyMaterials(parseInt(formChildren[0].textContent), parseInt(formChildren[2].value), formChildren[0].id);               
      constructedObjects[objIndex].craftItem(parseInt(formChildren[2].value));
      updateInventory();
      for (let i = 0; i < constructedObjects.length; i++){
        constructedObjects[i].enoughItems(i);
      }      
      e.target.reset();
    } else {
      constructedObjects[objIndex].inSale(formChildren, objIndex);
      if (constructedObjects[objIndex].inSaleStatus) {
        constructedObjects[objIndex].craftItem(1);
        updateInventory();
        for (let i = 0; i < constructedObjects.length; i++){
          constructedObjects[i].enoughItems(i);
        }
      }      
    }                  
  });
  // Listens to keyup events to call calcProfit method in an specific object
  form.children[0].addEventListener('keyup', e => {  
    const formChildren = e.target.parentElement.children;
    // Converts HTML collection to an array and gets the index of the e.target
  
    const objIndex = Array.prototype.slice.call(itemsToCraft).indexOf(e.target.parentElement);    
    constructedObjects[objIndex].price = parseInt(formChildren[0].value);
    constructedObjects[objIndex].calcProfit(formChildren[2]);
    // saves data
    todbConstructedObjs(formChildren[1].id, constructedObjects[objIndex]);
  })
});



const undo = () => {
  let stylingButtonClass = '';
  // Removes last snapshot from mementos
  mementos.pop();
  const lastMemento = mementos[mementos.length - 1];

  if (lastMemento !== 'undefined') {
    const epicCrafts = Object.keys(itemsPerRecipe);
    // Sets matsInfo to the one stored in lastMemento
    matsInfo = JSON.parse(lastMemento[0]);
    // Saves data to db
    todbMatsinfo();
  
    let i = 0;        
    // Loops through lastMemento 3rd element (an array) 
    lastMemento[1].forEach(obj => {
      const parsedObject = JSON.parse(obj);         
      // Sets current constructedObjects properties' values to the lastMemento ones
      constructedObjects[i].cost = parsedObject.cost;
      constructedObjects[i].price = parsedObject.price;
      constructedObjects[i].profit = parsedObject.profit;
      constructedObjects[i].inSaleStatus = parsedObject.inSaleStatus;    
      stylingButtonClass = constructedObjects[i].inSaleStatus ? 'o-crafts__btn--in-sale' : 'none';      
      // <<Saves data>>       
      todbConstructedObjs(epicCrafts[i], parsedObject);
      // Renders the items again with the new values
      displayCrafts.innerHTML += `
        <div class="o-crafts__item">
          <h3 class="o-crafts__title o-crafts__item-name o-text o-text-title">${constructedObjects[i].name}</h3>
          <form class="o-crafts__interface">              
            <input type="text" class="o-crafts__input o-crafts__price o-input" value="${constructedObjects[i].price}" placeholder="$">
            <input type="text" class="o-crafts__input o-crafts__cost o-input" id="${epicCrafts[i]}" value="${constructedObjects[i].cost}">
            <span class="o-crafts__text o-crafts__profit o-text-span">${constructedObjects[i].profit}</span>
            <button type="submit" class="o-crafts__btn o-btn ${stylingButtonClass}">In Sale</button>
          </form>
        </div>
      `;
      updateInventory();
      i++;
    });
  }   
}
undoButton.addEventListener('click', () => {
  undo();
});

// On click event it gets the target's id to reset the matsInfo values
// also saves to localStorage both objects
// Adds event listener to the whole inventory UI
inventoryMainUI.addEventListener('click', e => {
  // Only runs if e.target has certain class
  if (e.target.classList.contains('o-inventory__item-reset')) {
    // Gets the target's parentElement's id
    const itemID = e.target.parentElement.id;
    // Sets matsInfo values at 0 at given id
    matsInfo[itemID].price = 0;
    matsInfo[itemID].quantity = 0;
    
    // <<Saves data>>    
    todbMatsinfo();
    for (let i = 0; i<constructedObjects.length; i++) {
      updateApp(i);
    }
    updateInventory();
  }
});
mementoSave();