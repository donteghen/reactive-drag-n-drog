const {
    fromEvent, takeUntil, concatMap, tap, switchMap, distinctUntilChanged,
    merge
} = rxjs;

const leftContainer = document.querySelector('#container-left');
const rightContainer = document.querySelector('#container-right');

const wigets = Array.from(document.querySelectorAll('.widget'));

const onWidgetDragStart$ = wigets.map(widget => fromEvent(widget, 'dragstart'));
const onWidgetDrag$ = wigets.map(widget => fromEvent(widget, 'drag'));
const onWidgetDragEnd$ = wigets.map(widget => fromEvent(widget, 'dragend'));


// Subscription to handle the drag-and-drop logic
const widgetDragging$ = merge(...onWidgetDragStart$).pipe(
  tap(event => {
    console.log('Drag started:', event);
    // Any initial setup, like showing a visual cue, goes here
  }),
  switchMap(() => 
    merge(...onWidgetDrag$).pipe(
        distinctUntilChanged((prev, cur) => {
            return (prev.clientX === cur.clientX && prev.clientY === cur.clientY)
        }),
      tap(event => {
        console.log('Dragging at:', event.clientX, event.clientY);
        // Handle dragging logic, e.g., update element position
      }),
      takeUntil(merge(...onWidgetDragEnd$).pipe(
        tap(event => console.log('Drag ended:', event))
      ))
    )
  )
).subscribe();
