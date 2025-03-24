let topicsArr = [];
let sectionsArr = [];

let lastHoldButtonElement = null;
let lastDownElement = null;
let holdTimer;

function closeAddForm() {
    document.getElementById('add-form').classList.remove('visible');
    document.getElementById('topic-form').classList.remove('visible');
    document.getElementById('section-form').classList.remove('visible');
    document.getElementById('topic-title').value = '';
    document.getElementById('summary-field').value = '';
    document.getElementById('details-field').value = '';
}

function getTopicFromURL() {
    const url = new URL(window.location.href);
    return url.searchParams.get('topic');
}

function createTopic(topic){
    return `<div class="topic">
                <span>${topic}</span> 
                <button class="delete-button hidden" onclick="deleteTopic(this)">
                    <img src="x-mark.svg" height="30">
                </button>
            </div>`;
}

function addTopic(){
    const topicTitle = document.getElementById('topic-title').value.trim();
    if(topicTitle.length === 0){
        alert('You must enter a topic!');
    } else{
        if(topicsArr.includes(topicTitle)){
            alert('This topic already exists!');
        }else{
            const topicElement = {title:topicTitle};
            document.getElementById('topics-container').innerHTML += createTopic(topicTitle);
            
            fetch('topics.php', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(topicElement),
            }).then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                topicsArr.push(topicTitle);
            }).catch(error =>{
                console.error("Unable to fetch data:", error)
            });

            closeAddForm();
        }

        
    }
}

function deleteTopic(topic){
    topic.parentElement.classList.add('clear');

    const index = [...topic.parentNode.parentNode.children].indexOf(topic.parentNode);
    
    topic.parentElement.addEventListener('animationend', () => {
        document.getElementById(topic.parentElement.parentElement.id).removeChild(topic.parentElement);
    }, { once: true });

    fetch('topics.php', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"index": index}),
    }).then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        topicsArr.splice(index,1);
    }).catch(error =>{
        console.error("Unable to fetch data:", error)
    });
}

function getTopics(){
    fetch("./topics.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(data =>{
            displayTopics(data);
            topicsArr = data.map((t)=>t.title);
        })
        .catch(error =>{
            console.error("Unable to fetch data:", error)
        });
}

function displayTopics(topics){
    topics.forEach(topic => {
        document.getElementById('topics-container').innerHTML += createTopic(topic.title);
    });
}

function createSection(section){
    return `<li>
                <details>
                    <summary>
                        <span>${section.summary}</span>
                    </summary>
                    <div>${section.details}</div>
                    <button class="delete-button hidden" onclick="deleteSection(this)">
                        <img src="x-mark.svg" height="30">
                    </button>
                </details>
            </li>`;
}

function addSection(){
    let summary=document.getElementById('summary-field').value.trim();
    let details=document.getElementById('details-field').value.trim().replace(/\n/g, '<br>');

    if(summary!=='' && details!==''){
        if(sectionsArr.includes(summary)){
            alert('This section already exista for this topic!');
        }else{
            const sectionElement = {summary:summary,details:details,topic: getTopicFromURL()};
            document.getElementById('sections-list').innerHTML += createSection(sectionElement);

            fetch('sections.php', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sectionElement),
            }).then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                sectionsArr.push(summary);
            }).catch(error =>{
                console.error("Unable to fetch data:", error)
            });

            closeAddForm();
        }

        
    }else{
        alert('You must enter both summary and details!');
    }
}

function deleteSection(section){
    section.parentElement.parentElement.classList.add('clear');

    const index = [...section.parentNode.parentNode.parentNode.children].indexOf(section.parentNode.parentNode);
    
    section.parentElement.parentElement.addEventListener('animationend', () => {
        document.getElementById(section.parentElement.parentElement.parentElement.id).removeChild(section.parentElement.parentElement);
    }, { once: true });

    const sectionToDelete = {index: index, topic: getTopicFromURL()};

    fetch('sections.php', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionToDelete),
    }).then((res) => {
        if (!res.ok) {
            console.log(res.text());
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        sectionsArr.splice(index,1);
    }).catch(error =>{
        console.error("Unable to fetch data:", error)
    });
}

function displaySections(sections){
    sections.forEach(section => {
        document.getElementById('sections-list').innerHTML += createSection(section);
    });
}

function loadPage(){
    let topic = getTopicFromURL();
    if(topic === null){
        getTopics();
    }else{
        topic = topic.trim();
        if(topic.length === 0){
            document.getElementById('add-topic-button').classList.add('hidden');
            document.getElementById('topics-container').innerHTML = 'Error: No topic found.';
        }else{
            fetch(`sections.php?title=${topic}`) 
            .then(response => {
                if (!response.ok) {
                    throw new Error('No topic found');
                }
                return response.json(); 
            })
            .then(data => {
                document.getElementById('add-topic-button').classList.add('hidden');
                document.getElementById('topics-container').classList.add('hidden');
                document.getElementById('sections-list').classList.remove('hidden');
                document.getElementById('add-section-button').classList.remove('hidden');
                document.getElementById('topic-form').classList.remove('visible');
                displaySections(data['sections']);
                sectionsArr = data['sections'].map((s)=>s.summary);
                document.title += `- ${topic}`;
                document.getElementById('h1').innerHTML = topic;
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('add-topic-button').classList.add('hidden');
                document.getElementById('topics-container').innerHTML = 'Error: No topic found.';
            });
        }
    }
}

document.addEventListener('click', (e) => {
    if (document.getElementById('add-form').classList.contains('visible') && e.target==document.getElementById('add-form')) {
        closeAddForm();
    }
});

document.getElementById('close').addEventListener('click', closeAddForm);

document.getElementById('add-topic-button').addEventListener('click',(event)=>{
    document.getElementById('add-form').classList.add('visible');
    document.getElementById('topic-form').classList.add('visible');
    event.stopPropagation();
});

document.getElementById('add-topic-form-button').addEventListener('click', ()=>{
    addTopic();
});

document.getElementById('topic-title').addEventListener('keyup',(event)=>{
    if(event.key==="Enter"){
        addTopic();
    }
});

document.getElementById('add-section-button').addEventListener('click', (event)=>{
    document.getElementById('add-form').classList.add('visible');
    document.getElementById('section-form').classList.add('visible');
    event.stopPropagation();
});

document.getElementById('add-section-form-button').addEventListener('click', ()=>{
    addSection();
});

document.getElementById('sections-list').addEventListener('click',(event)=>{
    event.preventDefault();
});

document.getElementById('topics-container').addEventListener('pointerdown',(event)=>{
    if(event.target.classList.contains('topic') || event.target.tagName==='SPAN'){
        let targetTopic = null;
        if(event.target.tagName==='SPAN'){
            targetTopic=event.target.parentElement;
        }else{
            targetTopic = event.target;
        }

        if(!targetTopic.lastElementChild.classList.contains('visible')){
            holdTimer = setTimeout(() => {
                if(lastHoldButtonElement!==null){
                    lastHoldButtonElement.classList.remove('visible');
                }
                targetTopic.lastElementChild.classList.add('visible');
                lastHoldButtonElement = targetTopic.lastElementChild; 
                event.stopPropagation();
            }, 750);
        }
    } else if(event.target.classList.contains('delete-button') || event.target.parentElement.classList.contains('delete-button')){
        event.stopPropagation();
    }
});

document.getElementById('sections-list').addEventListener('pointerdown',(event)=>{
    if(event.target.tagName==='DETAILS' || event.target.tagName==='SUMMARY' || event.target.tagName==='DIV' || event.target.tagName==='SPAN'){
        let targetDetails = null;
        if(event.target.tagName==='SUMMARY' || event.target.tagName==='DIV'){
            targetDetails=event.target.parentElement;
        }else if(event.target.tagName==='SPAN'){
            targetDetails=event.target.parentElement.parentElement;
        }else{
            targetDetails = event.target;
        }

        if(!targetDetails.lastElementChild.classList.contains('visible')){
            holdTimer = setTimeout(() => {
                if(lastHoldButtonElement!==null){
                    lastHoldButtonElement.classList.remove('visible');
                }
                targetDetails.lastElementChild.classList.add('visible');
                targetDetails.open=true;
                lastHoldButtonElement = targetDetails.lastElementChild; 
                event.stopPropagation();
            }, 750);
        }
    } else if(event.target.classList.contains('delete-button') || event.target.parentElement.classList.contains('delete-button')){
        event.stopPropagation();
    }
});

document.addEventListener('pointerdown',(event)=>{
    lastDownElement = event.target;
    if(event.target.tagName==='SPAN' || (event.target.parentElement!==null && event.target.parentElement.tagName==='DETAILS' && event.target.tagName==='DIV')){
        lastDownElement=event.target.parentElement;
    }
    if(lastHoldButtonElement!==null){
        lastHoldButtonElement.classList.remove('visible');
    }
});

document.addEventListener('pointerup',(event)=>{
    clearTimeout(holdTimer);
    let eventTarget = event.target;
    if(eventTarget.tagName==='SPAN' || (eventTarget.parentElement!==null && eventTarget.parentElement.tagName==='DETAILS' && event.target.tagName==='DIV')){
        eventTarget = eventTarget.parentElement;
    }

    if(lastDownElement === eventTarget){
        if(!document.getElementById('topics-container').classList.contains('hidden')){
            if(lastHoldButtonElement!==eventTarget.lastElementChild && eventTarget.classList.contains('topic')){
                lastHoldButtonElement=null;
                window.location.href = `http://localhost/topics/index.html?topic=${eventTarget.firstElementChild.innerHTML}`;
            } else if(!eventTarget.classList.contains('topic') || (lastHoldButtonElement===eventTarget.lastElementChild && eventTarget.lastElementChild!==null && !eventTarget.lastElementChild.classList.contains('visible'))){
                if(lastHoldButtonElement!==null){
                    console.log('ceaules');
                    lastHoldButtonElement=null;
                }
            }
        }else{
            if(eventTarget.tagName==='SUMMARY' && !eventTarget.parentElement.open){
                eventTarget.parentElement.open = true;
            }else if(eventTarget.tagName==='SUMMARY' && lastHoldButtonElement!==eventTarget.parentElement.lastElementChild && eventTarget.parentElement.open && !eventTarget.parentElement.lastElementChild.classList.contains('visible')){
                eventTarget.parentElement.open = false;
            }else if(eventTarget.tagName!=='HTML' && eventTarget.lastElementChild!==null && ((lastHoldButtonElement===eventTarget.lastElementChild && !eventTarget.lastElementChild.classList.contains('visible')) || (lastHoldButtonElement===eventTarget.parentElement.lastElementChild && !eventTarget.parentElement.lastElementChild.classList.contains('visible')))){
                if(lastHoldButtonElement!==null){
                    lastHoldButtonElement=null;
                }
            }
        }
    }
});

document.getElementById('topics-container').addEventListener('pointerout',()=>{
    clearTimeout(holdTimer);
});

document.getElementById('sections-list').addEventListener('pointerout',()=>{
    clearTimeout(holdTimer);
});

window.addEventListener('load', loadPage);