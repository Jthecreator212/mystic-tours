# Page snapshot

```yaml
- button "Open sidebar":
  - img
- complementary "Admin sidebar navigation":
  - text: Mystic Tours Ops
  - button "Close sidebar":
    - img
  - text: Mystic Tours Ops
  - navigation "Sidebar links":
    - link "Dashboard":
      - /url: /mt-operations
      - img
      - text: Dashboard
    - link "Tours":
      - /url: /mt-operations/tours
      - img
      - text: Tours
    - link "Bookings":
      - /url: /mt-operations/bookings
      - img
      - text: Bookings
    - link "Images":
      - /url: /mt-operations/images
      - img
      - text: Images
    - link "Customers":
      - /url: /mt-operations/customers
      - img
      - text: Customers
    - link "Drivers":
      - /url: /mt-operations/drivers
      - img
      - text: Drivers
    - link "Assignments Calendar":
      - /url: /mt-operations/assignments-calendar
      - img
      - text: Assignments Calendar
    - link "Finances":
      - /url: /mt-operations/finances
      - img
      - text: Finances
    - link "Settings":
      - /url: /mt-operations/settings
      - img
      - text: Settings
- main:
  - navigation "breadcrumb":
    - list:
      - listitem:
        - link "Dashboard":
          - /url: /mt-operations
      - listitem:
        - link "Auth" [disabled]
  - img
  - text: MT Operations Secure Admin Access Portal
  - img
  - textbox "Admin Email"
  - img
  - textbox "Enter password"
  - button "Access Portal"
  - paragraph: Authorized Personnel Only
```