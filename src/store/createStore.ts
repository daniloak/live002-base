import { useEffect, useState, useSyncExternalStore } from "react";

type SetterFn<TState> = (prevState: TState) => Partial<TState>
type SetStateFn<TState> = (partialState: Partial<TState> | SetterFn<TState>) => void;

export function createStore<TState>(
    createState: (setState: SetStateFn<TState>, getState: () => TState) => TState
) {
  let state: TState;
  let listeners: Set<() => void>;

  function setState(partialState: Partial<TState> | SetterFn<TState>) {
    const newValue = typeof partialState === 'function' ? partialState(state) : partialState;

    state = {
      ...state,
      ...newValue
    };

    notifyListeners();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function notifyListeners(){
    listeners.forEach(listener=> listener());
  }

  function getState() {
    return state;
  }

  function useStore<TValue>(selector: (currentState: TState) => TValue): TValue {
    //const [value, setValue] = useState(() => selector(state));

    return useSyncExternalStore(subscribe, () => selector(state));
    // useEffect(() => {
    //   const unsubscribe = subscribe(() => {
    //     const newValue = selector(state);
    //     if (value !== newValue){
    //         setValue(newValue)
    //     }
    //   });
  
    //   return () => { unsubscribe() }
    // }, [selector, value]);

    // return value;
  }

  state = createState(setState, getState);
  listeners = new Set();

  return useStore ;
}
