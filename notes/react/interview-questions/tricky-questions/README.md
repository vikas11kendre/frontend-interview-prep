function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  return <button onClick={handleClick}>{count}</button>;
}

// what is value of count and why
// closures and 0
// what need to be done if we need updated value setCount(prev=>(prev+1))


function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("A");
  });

  useEffect(() => {
    console.log("B");
    return () => console.log("C");
  });

  console.log("D");

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

Initial render: D → A → B
The component body runs first, logging D. Then React fires effects in order after the browser paints: A, then B. No cleanup runs because there's no previous render to clean up.
First click: D → C → A → B
Clicking triggers a re-render. The component body runs again — D logs. Then React needs to re-run the effects (both have no dependency array, so they run every render). Before running them, React cleans up the previous render's effects. Only the second effect has a cleanup (console.log("C")), so C logs. Then the new effects fire in order: A, B.
Every subsequent click follows the same pattern: D → C → A → B.
The key rules to remember:

Component body runs synchronously during render (before paint).
Effects run after the browser paints, in declaration order.
Before re-running effects, React runs all cleanup functions from the previous render first, then all new effects.
Cleanup only exists if the effect returned a function — the first effect doesn't, so it has no cleanup step.


function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
        console.log("interval)
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>{count}</div>;
}

// here count has closure so it  will render1 times with value of count is 1 , we will get interval log contionuely it wont stop because we never clear the interval , clean up fuction will not trigger becasue of empty dependancy array
// we need to get updated value then change setCount(prev=>(prev+1));


function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Alice");

  useEffect(() => {
    console.log("effect ran:", name);
    return () => console.log("cleanup ran:", name);
  }, [name]);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <button onClick={() => setName("Bob")}>Change Name</button>
    </div>
  );
}
//what will log for following
/// intial render - effect ran: Alice
//count click 3 times - effect ran: Alice
//name click  -effect ran: Alice and effect ran: Bob
First two are spot on! The effect doesn't re-run when count changes because name isn't in the dependency array. That's the key concept — re-render happened 3 times but the effect didn't care.
Third one is close but the cleanup value is wrong. The cleanup function was created during the previous render, when name was still "Alice". Remember closures — the cleanup closes over the value from the render it was created in.
Exactly! So the full sequence for clicking Change Name is:
cleanup ran: Alice → effect ran: Bob
The cleanup closes over the old value, the new effect closes over the new value.
Does the concept make sense now — that cleanup is tied to the effect re-running, not to re-renders? The count button re-rendered 3 times but nothing logged because name didn't change.


function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  const handleClick = () => {
    setCount(count + 1);
    console.log(count);
  };

  return <button onClick={handleClick}>{count}</button>;
}
// You click the button once. What does console.log(count) print — 0 or 1? And why?
// 0 (closure)


function App() {
  const [items, setItems] = useState([1, 2, 3]);

  const handleClick = () => {
    items.push(4);
    console.log(items,items)
    setItems(items);
  };

  return (
    <div>
      <button onClick={handleClick}>Add</button>
      {items.map(i => <span key={i}>{i}</span>)}
    </div>
  );
}


//when it goes to log then items[1,2,3,4]
// but setimeout will compre current and value is passed as parameter and both are same so no rerender will happen
// items.push(4);
    console.log(items,items)
    setItems([...items]);
    will work but we should not directly manupute this value



    function App() {
  const [count, setCount] = useState(0);
  const ref = useRef(0);

  useEffect(() => {
    ref.current = count;
  });

  const handleClick = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);

    setTimeout(() => {
      console.log("state:", count);
      console.log("ref:", ref.current);
    }, 1000);
  };

  return <button onClick={handleClick}>{count}</button>;
}

// "state:", 0 and ref : 3

Not quite. useRef has nothing to do with the DOM here — that's only when you attach a ref to a JSX element.
Think about it differently. count is a primitive value (a number) — the closure captures its value at that moment, and it can't change.
But ref is an object ({ current: 0 }). The closure captures a reference to that object, not a copy. So when setTimeout reads ref.current after 1 second, it's reading the latest value on that same object — which the useEffect already updated to 3.
So the key distinction: closures capture primitive values as snapshots, but object references still point to the same mutable object. That's why useRef is the common escape hatch for reading the latest value inside stale closures.

<!-- read header, params ,quey parmas etc from url  -->