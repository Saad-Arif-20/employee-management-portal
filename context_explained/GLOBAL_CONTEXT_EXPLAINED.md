# GlobalContext.jsx - Line by Line Explanation (Roman Urdu)

Is file mein hum poori application ka "Brain" (Dimaagh) bana rahe hain. Yahan saara data (Employees, Projects, etc.) store hoga aur save bhi hoga.

Chalo line-by-line samajhte hain.

---

### **1. Imports**

```javascript
/* Line 1 */ import React, { createContext, useState, useEffect } from 'react';
/* Line 2 */ import { mockData } from './mockData';
```

**Explanation:**
*   **`createContext`**: Ye React ki factory hai job context banati hai. Iske bina hum data share nahi kar sakte.
*   **`useState`**: Ye React ki memory hai. Jab bhi humein koi data store karna hota hai jo change ho sake (jaise employees ki list), hum `useState` use karte hain.
*   **`useEffect`**: Ye ek "Side Effect" manager hai. Matlab jab kuch ho, to ye chalao. Hum isay use karenge taake jab bhi data change ho, wo LocalStorage mein save ho jaye.
*   **`mockData`**: Ye humara nakli data hai jo humne ek alag file mein rakha hua hai taake agar pehli baar app khule to kuch data dikhe.

---

### **2. Context Creation**

```javascript
/* Line 4 */ export const GlobalContext = createContext();
```

**Explanation:**
*   **Syntax:** `export const Naam = createContext();`
*   **Kyun?**: Humne ek khali dabba (box) banaya hai jiska naam "GlobalContext" hai. `export` isliye lagaya taake doosri files (jaise Dashboard) isay import kar sakein aur is dabba mein se data nikaal sakein.

---

### **3. The Provider Component (The Wrapper)**

```javascript
/* Line 6 */ export const GlobalProvider = ({ children }) => {
```

**Explanation:**
*   Ye ek normal React component hai, bas iska kaam UI dikhana nahi, data dena hai.
*   **`({ children })`**: Ye `{ children }` kya hai?
    *   Jab hum `App.jsx` mein `<GlobalProvider> <App /> </GlobalProvider>` likhte hain, to wo `<App />` jo beech mein hai, wo `children` ban jata hai.
    *   Matlab: "Main Provider hun, aur mere andar jo bhi aayega wo mera bachha (child) hai, main usay data dunga."

---

### **4. State Management - The Memory**

```javascript
/* Line 8-11 (Initial State Logic) */
const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : mockData.employees;
});
```

**Ye Bohaat Important Hai!**
Usually hum likhte hain `useState([])`, lekin yahan humne function pass kiya hai.

*   **Logic:**
    1.  React pehle dekhta hai: *"Kya browser ke LocalStorage mein 'employees' naam ki koi file padi hai?"* (`localStorage.getItem`)
    2.  **Agar haan (`saved` is true):** To usay JSON se wapas JavaScript object bana kar `employees` mein daal do (`JSON.parse`).
    3.  **Agar na:** To nakli data use karo (`mockData.employees`).
*   **Result:** Jab tum page refresh karte ho, tumhara data gayab nahi hota kyunki wo LocalStorage se uthata hai.

(Same logic Projects, Subscriptions, aur Assets ke liye bhi repeate hoti hai next lines mein).

---

### **5. Automatic Saving - The Persistence**

```javascript
/* Line 37-39 */
useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
}, [employees]);
```

**Explanation:**
*   **`useEffect`**: Ye kehta hai: *"Main tab chalunga jab..."*
*   **`[employees]` (Dependency Array):** Ye kehta hai: *"...jab bhi 'employees' variable change ho."*
*   **Action:** Jab bhi tum naya employee add karte ho, `employees` change hota hai -> `useEffect` chalta hai -> aur naya data LocalStorage mein save (`setItem`) ho jata hai.
*   **`JSON.stringify`**: Browser sirf Text (String) save kar sakta hai, Object nahi. To hum apne Object ko String mein convert kar dete hain.

---

### **6. Helper Functions (Actions)**

Yahan wo functions hain jo hum Component ko denge taake wo data change kar sakein.

**Adding Data:**
```javascript
/* Line 54 */
const addEmployee = (employee) => {
    /* Line 55 */
    const newEmployee = { ...employee, id: Date.now() };
    /* Line 56 */
    setEmployees([...employees, newEmployee]);
};
```
*   **Line 55 (`...employee`):** Iska matlab "Spread Operator". Jo bhi data form se aaya (name, email...) usay copy karo, aur usme `id: Date.now()` (current time ka number) jod do taake har banda unique ho.
*   **Line 56 (`[...employees, newEmployee]`):**
    *   **Galat Tareeqa:** `employees.push(newEmployee)` (React isay detect nahi karega).
    *   **Sahi Tareeqa:** Purani list ko copy karo (`...employees`), uske aage naya banda lagao, aur ek nayi list bana do. Tabhi React screen update karega.

**Updating Data:**
```javascript
/* Line 59 */
const updateEmployee = (id, updatedData) => {
    setEmployees(employees.map(emp => 
        emp.id === id ? { ...emp, ...updatedData } : emp
    ));
};
```
*   **`map` Function:** Ye list ke har banday ko check karta hai.
*   **Logic:**
    *   Kya tumhari ID match hui?
    *   **Haan:** To purana data lo (`...emp`) aur usay naye data se overwrite kardo (`...updatedData`).
    *   **Nahi:** To waisa ka waisa rehne do (`: emp`).

**Deleting Data:**
```javascript
/* Line 65 */
const removeEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
};
```
*   **`filter` Function:** Ye channi (sieve) ki tarah hai.
*   **Logic:** "Sirf un logon ko list mein rakho jinki ID match NAHI hoti." Jinki ID match ho gayi, wo list se bahar nikal jayenge.

---

### **7. The Return Statement (Dukaan)**

Akhir mein hum sab kuch pack karke bhejte hain.

```javascript
/* Line 88 */
return (
    <GlobalContext.Provider value={{
        employees,
        addEmployee,
        updateEmployee,
        removeEmployee,
        // ... baaki sab data aur functions
    }}>
        {children}
    </GlobalContext.Provider>
);
```

*   **`value={{ ... }}`**: Ye wo jhola (bag) hai jo hum `App` ko de rahe hain. Is jhole mein `employees` ki list bhi hai, aur `addEmployee` ka button (function) bhi.
*   Ab Dashboard page par koi bhi `useContext(GlobalContext)` bol kar is jhole mein haath daal kar `employees` nikaal sakta hai.

---

### **Summary - Dimaagh mein kaise bithayen?**

1.  **Dabba Banao:** `createContext`
2.  **Memory Rakho:** `useState` (LocalStorage logic ke saath)
3.  **Auto Save Lagao:** `useEffect`
4.  **Buttons Banao:** `add`, `update`, `delete` functions.
5.  **Pack Karke Bhejo:** `<Provider value={{ sab kuch }}> {children} </Provider>`

Ye hai GlobalContext ki poori kahani!
