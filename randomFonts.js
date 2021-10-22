let fonts = ["'Comic Sans MS'", "'Arial Black'", "'Times New Roman'", "'Windings 3'"]
words = document.getElementsByClassName('random');
for(word of words){
    let inner = word.innerHTML.split(" ")
    actualText = false
    newHtml = ""
    for(let i =  0; i < inner.length; i++){
        let index = Math.floor(Math.random()*(fonts.length-1))
        newHtml += "<span style=\"font-family:" + fonts[index] + "\">"
        if(i != inner.length-1) {
            newHtml += inner[i] + " "
        }else{
            newHtml += inner[i]
        }
        newHtml += "</span>"
    }
    word.innerHTML = newHtml
}