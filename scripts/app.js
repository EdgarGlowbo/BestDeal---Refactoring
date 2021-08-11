// Queries
// Buy mats interface
const matPrice = document.querySelector(".o-input-price");
const matQuantity = document.querySelector(".o-input-quantity");
const submitMaterialsForm = document.querySelector(".m-main-ui__form");
const dropdownListDisplay = document.querySelector(".o-form__dropdown-list");
const materialList = document.querySelector('.o-materials__list');
// Available crafts window
const displayCrafts = document.querySelector(".m-crafts");
// Inventory window
const inventoryMainUI = document.querySelector('.m-main-ui__inventory');


// Stores the id of the material selected in a mouse event

let selectedMat = 'eternalFire';

//Stores constructed objects
const constructedObjects = [];

// Submit prices and quantity of materials 

const buyMaterials = (price, quantity, material) => {

  // Checks for items in quantityCounter

  if (quantityCounter[material] === 0) {
    rawAverage[material] = price;
    quantityCounter[material] = quantity;

  } else {

    const average = rawAverage[material];
    const inBag = quantityCounter[material];

    const newAverage =  ((average * inBag) + (price * quantity)) / (inBag + quantity);
    rawAverage[material] = Math.round(newAverage);
    quantityCounter[material] += Math.round(parseInt(quantity));

  }
  localStorage.setItem('averages', JSON.stringify(rawAverage));
  localStorage.setItem('inventory', JSON.stringify(quantityCounter)); 
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
      calculatedCost += this.recipe[material] * rawAverage[material];
      this.cost = calculatedCost;            
    });
    return this;
  }
  craftItem(quantity) {
    Object.keys(this.recipe).forEach(material => {
      quantityCounter[material] -= (this.recipe[material] * quantity)      
    });
    localStorage.setItem('averages', JSON.stringify(rawAverage));
    localStorage.setItem('inventory', JSON.stringify(quantityCounter));        
    return this;
  }
  renderCrafts(i) {
    matCost[i].textContent = Math.round(this.cost).toString();
  }
  enoughItems(i) {    
    itemsToCraft[i].parentElement.classList.add('o-crafts__item--available');
    Object.keys(this.recipe).forEach(mat => {      
      
      if (quantityCounter[mat] < this.recipe[mat]) {
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
  calcProfit(price) {
    this.profit = price - this.cost;
    return this;
  }
  inSale(target, objIndex) {
    if (this.inSaleStatus) {
      // If inSaleStatus === true then remove item from localstorage and calls renderEpics to update the value
      // for the target        
      this
        .calcCraftCost(objIndex)
        .renderEpics(objIndex)
        .inSaleStatus = false;
      target[3].classList.remove('o-crafts__btn--in-sale');  
      localStorage.removeItem(target[1].id);
        
    } else {
      // Calls craftItem and inSale methods. 
      this.inSaleStatus = true;      
      target[3].classList.add('o-crafts__btn--in-sale');
      localStorage.setItem(target[1].id, JSON.stringify(constructedObjects[objIndex]));
    }        
  }
 
  renderEpics(i) {
    craftCostInput[i].value = Math.round(this.cost).toString();
    return this;
  }
}
// Constructs all of the objects at the start of the application
const startApp = () => {
  if (localStorage.getItem('averages') && localStorage.getItem('inventory')) {
    quantityCounter = JSON.parse(localStorage.getItem('inventory'));
    rawAverage = JSON.parse(localStorage.getItem('averages'));
  }


  if (typeof materialsRecipe === 'undefined') {
    const epicCrafts = Object.keys(itemsPerRecipe);
    let stylingButtonClass = '';
  
      // Creates objects instances and pushes them to an array
      epicCrafts.forEach(item => constructedObjects.push(new AvailableEpics(itemsPerRecipe[item]["name"], JSON.stringify(itemsPerRecipe[item]["recipe"]))));
           
    
    for (let i = 0; i < epicCrafts.length; i++) {
      // Checks for saved objects in localstorage and sets cost and insalestatus properties to the values of the saved objects before rendering them

      if (localStorage.getItem(epicCrafts[i])) {
        const savedObj = JSON.parse(localStorage.getItem(epicCrafts[i]))
        constructedObjects[i].cost = savedObj.cost;
        constructedObjects[i].inSaleStatus = true;
        stylingButtonClass = 'o-crafts__btn--in-sale';
      } else {
        stylingButtonClass = 'none';
      }                  
      displayCrafts.innerHTML += `
        <div class="o-crafts__item">
          <h3 class="o-crafts__title o-crafts__item-name o-text o-text-title">${constructedObjects[i].name}</h3>
          <form class="o-crafts__interface">              
            <input type="text" class="o-crafts__input o-crafts__price o-input">
            <input type="text" class="o-crafts__input o-crafts__cost o-input" id="${epicCrafts[i]}" value="${constructedObjects[i].cost}">
            <span class="o-crafts__text o-crafts__profit o-text-span">${constructedObjects[i].profit}</span>
            <button type="submit" class="o-crafts__btn o-btn ${stylingButtonClass}">In Sale</button>
          </form>
        </div>
      `;
    }
              
  } else {
    const matCrafts = Object.keys(materialsRecipe);
    
      matCrafts.forEach(item => constructedObjects.push(new AvailableCrafts(materialsRecipe[item]["name"], JSON.stringify(materialsRecipe[item]["recipe"]))));
      
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
// Renders the name from the materials in materialList ul, gets the id of the li elements to access those properties in quantityCounter and rawAverage and display them
const startInventory = () => {  
  for (let i = 0; i < materialList.children.length; i++) {
    const matName = materialList.children[i].textContent;
    const matId = materialList.children[i].id;
    inventoryMainUI.innerHTML += `
    <div class="o-inventory__item">
      <span class="o-inventory__item-name o-text-span">${matName}</span>
      <span class="o-inventory__item-amount o-text-span">${quantityCounter[matId]}</span>
      <span class="o-inventory__item-price o-text-span o-text-span--color">$${rawAverage[matId]}</span>
    </div>
    `;                  
  }
}

startApp();
startInventory();


// Mat cost text span query
const matCost = document.querySelectorAll(".o-crafts__item-cost");
// calculated cost in epics query
const craftCostInput = document.querySelectorAll(".o-crafts__cost");
// Each item form query
const itemsToCraft = document.querySelectorAll('.o-crafts__interface');
// Query to each inventory item
const inventoryItem = document.querySelectorAll('.o-inventory__item');

const updateInventory = () => {
  let i = 0;
  inventoryItem.forEach(item => {
    const itemChildren = item.children;
    const matId = materialList.children[i].id;
    itemChildren[1].textContent = quantityCounter[matId].toString();    
    itemChildren[2].textContent = '$' + rawAverage[matId].toString();
    i++;
  });
};


// Listens for submit events in top form
submitMaterialsForm.addEventListener('submit', e => {
  e.preventDefault();

  buyMaterials(parseInt(matPrice.value), parseInt(matQuantity.value), selectedMat);
  updateInventory();
  submitMaterialsForm.reset();

  // Updates objects values each submit event
  let i = 0;
  constructedObjects.forEach(obj => {
    
    if (typeof materialsRecipe !== "undefined") {
      obj.calcCraftCost();
      obj.renderCrafts(i);
      obj.enoughItems(i);
      
      i++;
    } else {
      if (!constructedObjects[i].inSaleStatus) {
        obj.calcCraftCost();
        obj.renderEpics(i);              
      } 
      obj.enoughItems(i);  
      i++      
    }
  
  });    

});
// Updates selectedMat value with the value selected in the dropdown list
dropdownListDisplay.addEventListener('click', e => {
  // Removes display none class
  if (e.target === dropdownListDisplay || e.target === dropdownListDisplay.children[0]) {
    dropdownListDisplay.children[1].classList.toggle('o-materials__list--display-none');    
  } else {
    selectedMat = e.target.id;
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
    constructedObjects[objIndex].calcProfit(parseInt(formChildren[0].value) * 0.95);
    // itemsToCraft (form) children nodes to update span element
    formChildren[2].textContent = constructedObjects[objIndex].profit.toString();
    
  })
});

const updateApp = () => {
  let i = 0;
  constructedObjects.forEach(obj => {
    
    if (typeof materialsRecipe !== "undefined") {
      obj.calcCraftCost();
      obj.renderCrafts(i);
      obj.enoughItems(i);
      i++;
    } else {
      if (!constructedObjects[i].inSaleStatus) {
        obj.calcCraftCost();
        obj.renderEpics(i);              
      } 
      obj.enoughItems(i);
      i++      
    }
  
  });    
}
updateApp();
