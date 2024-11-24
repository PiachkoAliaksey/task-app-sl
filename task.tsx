import { useEffect, useState, useRef, useCallback, memo, ReactNode } from 'react';
import './styles.css';

type Mode = 'add' | 'remove';

type TButton = {
  className?: string,
  handlerClick?: () => void,
  children: ReactNode
}

const useRenderCounter = () => {
  const counter = useRef(0);
  counter.current++;

  return counter.current;
};

const RenderCountLabel = ({
  count,
  label,
}: {
  count: number;
  label: string;
}) => {
  return (
    <div>
      {label} renders: <span style={{ color: 'red' }}>{count}</span>
    </div>
  );
};

const Button = memo(({ className, handlerClick, children }: TButton) => {
  return <button onClick={handlerClick} className={className}>{children}</button>
})


const ButtonWithRenderingCountLabel = memo(
  ({ children, onClick }: { children: ReactNode; onClick: () => void }) => {
    const counter = useRenderCounter();

    return (
      <div>
        <Button handlerClick={onClick}>{children}</Button>
        <RenderCountLabel label="Button" count={counter} />
      </div>
    );
  }
);



const ChangeModeButton = memo(({
  action,
  onClick,
}: {
  action: Mode;
  onClick: () => void;
}) => {
  const counter = useRenderCounter();
  return (
    <div>
      <Button handlerClick={onClick}>{`change mode: ${action}`}</Button>
      <RenderCountLabel label="Button" count={counter} />
    </div>
  );
})

const ListItem = memo(({
  item,
  onRemove,
}: {
  item: string;
  onRemove: (item: string) => void;
}) => {
  const [hasClass, setHasClass] = useState(true);

  const onClick = useCallback(() => {
    setHasClass(false);

    setTimeout(() => {
      setHasClass(true);
    }, 0);
  }, []);
 
  return (
    <li onClick={onClick} className={hasClass?"li-item":undefined}>
      {item}
      <Button className="btn-remove" handlerClick={() => onRemove(item)}>x</Button>
    </li>
  );
})


const List = () => {
  const counter = useRenderCounter();
  const index = useRef(0);
  const [items, setItems] = useState<string[]>([]);
  const [action, setAction] = useState<Mode>('add');

  const handleChangeAction = useCallback(() => {
    setAction((prev) => (prev === 'add' ? 'remove' : 'add'));
  }, [])

  const handleRemoveItems = useCallback(() => {
    setItems((prev) => prev.slice(0, prev.length - 1));
  }, [])

  const handleRemoveItem = useCallback((itemToRemove: string) => {
    setItems((prev) => {
      if (prev.length) {
        return prev.filter((item) => item !== itemToRemove)
      }
      return prev
    })

  }, [])

  const handleAddItem = useCallback(() => {
    index.current++;
    setItems((prev) => [...prev, `${index.current}-item`]);
  }, [])

  const handleAddToStart = useCallback(() => {
    index.current++;
    setItems((prev) => [`${index.current}-item`, ...prev,])
  }, [])

  useEffect(() => {
    const timerId = setInterval(
      () => (action === 'add' ? handleAddItem() : handleRemoveItems()),
      1000
    );

    return () => {
      clearInterval(timerId)
    }
  }, [action,handleAddItem, handleRemoveItems]);

  return (
    <ul className="list">
      <RenderCountLabel label="List" count={counter} />
      <br />
      <ChangeModeButton action={action} onClick={handleChangeAction} />
      <br />
      <div className="btn-actions">
        <ButtonWithRenderingCountLabel onClick={handleAddToStart}>Add to start</ButtonWithRenderingCountLabel>
        <ButtonWithRenderingCountLabel onClick={handleAddItem}>Add to end</ButtonWithRenderingCountLabel>
      </div>
      {items.map((item) => (
        <ListItem key={item} item={item} onRemove={handleRemoveItem} />
      ))}
    </ul>
  );
};

function App() {
  return (
    <div>
      <List />
    </div>
  );
}

export default App;