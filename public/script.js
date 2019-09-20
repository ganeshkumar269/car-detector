var ipTag = document.querySelector("input");
var buttonTag = document.querySelector("button");
var pTag = document.querySelector("p");
var submitBtn = document.querySelector("#submit-btn");
var customSubmit = document.querySelector("#custom-submit");




buttonTag.addEventListener("click",()=>{
    ipTag.click();
});

ipTag.addEventListener("change",()=>{
    if(ipTag.value)
        pTag.innerHTML = ipTag.value.split('\\')[2];
    else 
        pTag.innerHTML = "No file Chosen, yet";
});

customSubmit.addEventListener("click",()=>{
    submitBtn.click();
});