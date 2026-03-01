import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { getInitialAdminState } from './AdminState';
import { adminMethods } from './AdminMethods';

const AdminContext = createContext(null);

function createAdminStore(onChange) {
    const rawState = getInitialAdminState();
    const methods = adminMethods || {};

    const store = { ...rawState, ...methods };
    const proxyMap = new WeakMap();
    let updateTimeout = null;

    // Batch updates to avoid too many React re-renders from rapid mutations
    function triggerChange() {
        if (updateTimeout) return;
        updateTimeout = setTimeout(() => {
            onChange();
            updateTimeout = null;
        }, 0);
    }

    function makeProxy(target) {
        if (target === null || typeof target !== 'object') return target;
        // Do not proxy promises, dates, or DOM nodes
        if (target instanceof Promise || target instanceof Date || target instanceof Element || target instanceof Function) {
            return target;
        }

        if (proxyMap.has(target)) return proxyMap.get(target);

        const proxy = new Proxy(target, {
            get(obj, prop, receiver) {
                if (prop === '$nextTick') return (cb) => setTimeout(cb, 0);
                if (prop === '$watch') return () => { }; // Mock $watch for now
                const val = Reflect.get(obj, prop, receiver);
                return makeProxy(val);
            },
            set(obj, prop, value, receiver) {
                // Only trigger update if the value actually changed
                const oldValue = Reflect.get(obj, prop, receiver);
                if (oldValue !== value) {
                    const result = Reflect.set(obj, prop, value, receiver);
                    triggerChange();
                    return result;
                }
                return true;
            },
            deleteProperty(obj, prop) {
                const result = Reflect.deleteProperty(obj, prop);
                triggerChange();
                return result;
            }
        });

        proxyMap.set(target, proxy);
        return proxy;
    }

    const proxy = makeProxy(store);

    // Bind all methods to the proxy object so `this` inside methods refers to the proxy
    for (const key in methods) {
        if (typeof methods[key] === 'function') {
            store[key] = methods[key].bind(proxy);
        }
    }

    return proxy;
}

export function AdminProvider({ children }) {
    const [tick, setTick] = useState(0);
    const storeRef = useRef(null);
    const isInit = useRef(false);

    if (!storeRef.current) {
        storeRef.current = createAdminStore(() => {
            setTick(t => t + 1);
        });
    }

    useEffect(() => {
        if (!isInit.current && storeRef.current && typeof storeRef.current.init === 'function') {
            isInit.current = true;
            storeRef.current.init();
        }
    }, []);

    return (
        <AdminContext.Provider value={{ store: storeRef.current, tick }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context.store;
}
