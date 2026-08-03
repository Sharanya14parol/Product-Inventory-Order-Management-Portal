# Inventory Portal

A SAPUI5-based Inventory Portal for managing and monitoring product inventory. The application demonstrates core SAPUI5 development concepts including MVC architecture, JSON data binding, routing, reusable fragments, client-side validation, filtering, sorting, grouping, formatting, and internationalization.

---

## 1. Technology Stack

* SAPUI5
* JavaScript
* XML Views
* JSONModel
* JSON data
* UI5 Routing
* XML Fragments
* UI5 Data Binding
* UI5 Formatter
* SAP Business Application Studio (BAS)
* UI5 Tooling
* npm

---

## 2. Running the Application in SAP Business Application Studio

### Prerequisites

Ensure the BAS Dev Space has:

* Node.js
* npm
* UI5 Tooling

The project contains the required `package.json` and `ui5.yaml` configuration files.

### Step 1: Open the project

Open the project in SAP Business Application Studio:
inventory-portal

### Step 2: Open a terminal

From BAS:

Terminal → New Terminal

Navigate to the project directory:

cd inventory-portal

### Step 3: Install dependencies

Run:

npm install

### Step 4: Start the application

Run:
npm start

The UI5 development server will start and BAS will provide an option to preview the application.

Or Else run :
ui5 serve


### Step 5: Open the application

Open the generated BAS preview URL.

The application entry point is:
index.html


The application uses hash-based UI5 routing.
For example:
index.html#/list


---
## Project Structure

```text
inventory-portal/
│
├── webapp/
│   │
│   ├── controller/
│   │   ├── App.controller.js
│   │   ├── BaseController.js
│   │   ├── List.controller.js
│   │   ├── Detail.controller.js
│   │   └── NotFound.controller.js
│   │
│   ├── view/
│   │   ├── App.view.xml
│   │   ├── List.view.xml
│   │   ├── Detail.view.xml
│   │   └── NotFound.view.xml
│   │
│   ├── fragment/
│   │   ├── AddEditProduct.fragment.xml
│   │   └── ViewSettings.fragment.xml
│   │
│   ├── model/
│   │   ├── formatter.js
│   │   └── products.json
│   │
│   ├── i18n/
│   │   ├── i18n.properties
│   │   └── i18n_en.properties
│   │   └── i18n_de.properties
│   │
│   ├── Component.js
│   ├── manifest.json
│   └── index.html
│
├── package.json
├── ui5.yaml
├── .gitignore
└── README.md
```

### Key Components

| File / Folder                | Purpose                                       |
| ---------------------------- | --------------------------------------------- |
| `webapp/controller/`         | Controller and application logic              |
| `webapp/view/`               | XML views                                     |
| `webapp/fragment/`           | Reusable dialogs and View Settings            |
| `webapp/model/products.json` | Application product data                      |
| `webapp/model/formatter.js`  | Reusable formatting logic                     |
| `webapp/i18n/`               | Internationalized UI texts                    |
| `Component.js`               | Application component initialization          |
| `manifest.json`              | Application configuration, models and routing |
| `index.html`                 | Application entry point                       |
| `package.json`               | Dependencies and npm scripts                  |
| `ui5.yaml`                   | UI5 Tooling configuration                     |
| `.gitignore`                 | Excludes generated, unnecessary files         |

Generated files such as `dist/` and installed dependencies such as `node_modules/` are excluded from source control.

---

# 4. Implemented Features

## Product Management

The application provides a product inventory list backed by a JSON model.

Each product can contain:

* Product ID
* Name
* Category
* SKU
* Price
* Currency
* Stock
* Reorder Threshold
* Supplier
* Warehouse
* Description
* Image URL
* Last Updated date

The product data is maintained in:
webapp/model/products.json

---

## Product Search

Users can search the inventory using:

* Product name
* Product category

Search results are updated dynamically using UI5 filtering.

---

## Sorting

The View Settings dialog provides sorting options for:

* Name
* Price
* Stock

---

## Grouping

Products can be grouped by:

* Category

Grouping is implemented using a UI5 `Sorter` with grouping enabled.

For example:

Accessories
    Mechanical Keyboard
    Wireless Mouse

Hardware
    Barcode Scanner
    Business Laptop

Office
    Laser Printer
    Document Scanner

---

## Filtering

The application supports multiple filtering criteria.

### Category

* Hardware
* Accessories
* Office
* Networking
* Storage

### Stock Status

* Available
* Low Stock
* Out of Stock

### Price Range

* Under $50
* $50–$200
* Over $200

---

## Stock Status

Stock status is determined from the current stock and reorder threshold.

The application uses the following rules:

stock = 0
→ Out of Stock

stock <= reorderThreshold
→ Low Stock

stock > reorderThreshold
→ Available

The formatter is responsible for presentation-related stock status/state logic.

---

## Product Details

Selecting a product navigates to its detail page.

UI5 routing is used to pass the product ID as a route parameter.

Example:

#/detail/P2001
The detail page displays the selected product's information.

---

## Add Product

A reusable Add/Edit Product fragment is used to create new products.

The dialog allows users to enter product information including:

* Name
* Category
* SKU
* Price
* Currency
* Stock
* Reorder Threshold
* Supplier
* Warehouse
* Description
* Image URL

After successful validation, the new product is appended to the JSON model.

---

## Edit Product

The same reusable fragment is used for editing existing products.

The selected product is loaded into the dialog using the product's binding context.

Two-way binding allows form changes to update the working product model.

On Save:

* The existing product is identified using its Product ID.
* Updated values are written to the JSON model.
* `lastUpdated` is updated.
* The product list reflects the changes.

---

## Client-Side Validation

The Add/Edit form validates user input before saving.

### Required fields

Required fields cannot be empty.

### Price

Price must be:

* Numeric
* Greater than or equal to zero

### Stock

Stock must be:

* Numeric
* Greater than or equal to zero

### Reorder Threshold

Reorder threshold must be:

* Numeric
* Greater than or equal to zero

### Currency

Currency must contain a three-character currency code.

Invalid inputs display UI5 `ValueState.Error` feedback and corresponding validation messages.

Products are not saved when validation fails.

---

## Cancel / Discard Changes

The Cancel action closes the Add/Edit dialog without saving the changes.

This prevents invalid or unintended changes from being committed to the product model.

---

## Reusable Fragments

The project uses XML fragments to keep dialogs reusable and maintainable.

### Add/Edit Product

webapp/fragment/AddEditProduct.fragment.xml

The same fragment is used for:

* Add Product
* Edit Product

### View Settings

webapp/fragment/ViewSettings.fragment.xml

The View Settings dialog provides:

* Sorting
* Filtering
* Grouping

---

## Routing and Navigation

Routing is configured in:

webapp/manifest.json

The application provides navigation for:

* Product List
* Product Details
* Not Found

Product IDs are passed as route parameters for detail navigation.

---

## Not Found Page

A dedicated Not Found page handles invalid application routes.

It provides:

* A user-friendly error message
* A navigation action to return to the product list

---

## Internationalization

User-facing texts are maintained in the i18n resource bundle:

webapp/i18n/i18n.properties


This includes:

* Page titles
* Button labels
* Field labels
* Validation messages
* Dialog titles
* Status texts
* Error messages
* Navigation texts

This avoids hardcoding user-facing text throughout the application.

---

## Formatter

Reusable presentation logic is maintained separately in:

webapp/model/formatter.js

The formatter handles display-related transformations such as stock status and state.

---

# 8. Build

To create a production build, run:

npm run build

Alternatively:
 ui5 build


The generated build output should normally remain outside source control unless the deployment process specifically requires it.

---

# 9. Data and Persistence

Product data is stored locally in:

webapp/model/products.json

The application uses a client-side JSON model.

Add and Edit operations modify the model during the current application session. These changes are not persisted back to `products.json` and therefore will not remain after the application is restarted.

---

# 10. Project Objective

The objective of this project is to demonstrate the development of a functional SAPUI5 Inventory Portal using standard UI5 application architecture and development practices.

The application brings together MVC architecture, JSON data binding, routing, reusable fragments, client-side validation, filtering, sorting, grouping, formatter logic, internationalization, and dynamic model updates into a single inventory management application.
