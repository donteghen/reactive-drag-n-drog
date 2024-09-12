const {
    fromEvent, takeUntil, concatMap, tap, switchMap, distinctUntilChanged, takeLast, first,
    merge
} = rxjs;

const containerTodoId = 'container-todo';
const containerProgressId = 'container-progress';
const containerDoneId = 'container-done';

const todoContainer = document.querySelector(`#${containerTodoId}`);
const progressContainer = document.querySelector(`#${containerProgressId}`);
const doneContainer = document.querySelector(`#${containerDoneId}`);

const BOUND_EDGE_TOLERANCE = 20;


const wigets = Array.from(document.querySelectorAll('.widget'));

const onWidgetDragStart$ = wigets.map(widget => fromEvent(widget, 'dragstart'));
const onWidgetDrag$ = wigets.map(widget => fromEvent(widget, 'drag'));
const onWidgetDragEnd$ = wigets.map(widget => fromEvent(widget, 'dragend'));

const updatePipelineCount = () => {
    document.querySelector('#todo-count').textContent = todoContainer.children.length;
    document.querySelector('#progress-count').textContent = progressContainer.children.length;
    document.querySelector('#done-count').textContent = doneContainer.children.length;
}
updatePipelineCount(); // initial page load.

const removeChild = (parent, child) => {
    parent.removeChild(child);
}

const appendChild = (parent, child) => {
    parent.appendChild(child);
}

const getNumberFromId = (id) => id.replace(/\D/g, '');

const sortContainer = (container) =>  {  
    Array.from(container.children)
    .sort((a, b) => {
        return getNumberFromId(a.id) - getNumberFromId(b.id)
    })
    .forEach(child => {
        container.appendChild(child)
    });
}

const getLinkedContainer = (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const currentContainer = document.querySelector(`#${event.target.id}`)?.parentNode;
    let targetContainer = null;
    
    [todoContainer, progressContainer, doneContainer].forEach(container => {
        const rect = container.getBoundingClientRect();

        const withinX = mouseX >= rect.left - BOUND_EDGE_TOLERANCE && mouseX <= rect.right + BOUND_EDGE_TOLERANCE;
        const withinY = mouseY >= rect.top - BOUND_EDGE_TOLERANCE && mouseY <= rect.bottom + BOUND_EDGE_TOLERANCE;

        if (withinX && withinY) {
            targetContainer = container;
        }
    });
    return {targetParent: targetContainer, currentParent: currentContainer};
}

const handleDragSubscription = (event) => {
    
    const {targetParent, currentParent}  = getLinkedContainer(event);
    const child = document.querySelector(`#${event.target.id}`)
    
    if (targetParent && currentParent) { 
        removeChild(currentParent, child);
        sortContainer(currentParent);  

        appendChild(targetParent, child);
        sortContainer(targetParent);  
        
        updatePipelineCount()
    }    
}



const widgetDragging$ = merge(...onWidgetDragStart$).pipe(  
  switchMap(() => 
    merge(...onWidgetDrag$).pipe(
        distinctUntilChanged((prev, cur) => {
            return (prev.clientX === cur.clientX && prev.clientY === cur.clientY)
        }),      
      takeUntil(merge(...onWidgetDragEnd$)),
      takeLast(2),
      first()
    )
  )
).subscribe({
    next: event => {
        handleDragSubscription(event)
    },
    error: e => {
        window.alert(e?.message??'OOps something when wrong. Check the logs!');
        console.log("error:", e);
    },
    complete: () => {
        console.log('Drag done for this element!')
    }
});

