# Warehouse DB Dictionary

This dictionary is a review aid for the current Warehouse DBML. It keeps the model focused on what Warehouse needs now: raw-material custody, supplies, and finished product custody.

## Review focus

- Technical IDs use `_id`; visible business numbers/codes use `_number` or `_code`.
- Raw material is intentionally simple: `raw_material` keeps the bale/fardo identity, original receipt evidence, and whole-bale delivery facts.
- The Warehouse-owned production identity is the single lot identity used by Warehouse and Lot Processing.
- Finished product stays under the existing production identity; Warehouse does not create a second product identity.
- Supplies are intentionally simple: what was received, what was delivered, to whom, and how much.
- Correction history is separated from current business records.

## Tables

### `production_identities`

Represents the single lot identity initially defined by Warehouse before production and reused by Lot Processing and Warehouse.

| Field                    | Why it exists                                                              | Optional / challenge later                               |
| ------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| `production_identity_id` | Technical Warehouse-owned identifier.                                      | No.                                                      |
| `lot_code`               | Visible shared business code for operators and cross-context traceability. | No, but final format may change.                         |
| `yarn_count_id`          | Required reference to the shared Catalogs yarn count requested for production. | No.                                                   |
| `required_color`         | Requested color for production.                                            | Yes.                                                     |
| `destination_name`       | Customer or destination known when defining the identity.                  | Yes.                                                     |
| `production_variant`     | Captures business variant/classification when needed.                      | Yes; challenge if it duplicates future catalog data.     |
| `request_notes`          | Keeps request-specific instructions.                                       | Yes.                                                     |
| `business_defined_at`    | Business time of the definition, separate from system capture.             | No.                                                      |
| `defined_by_user_id`     | User who recorded or defined the identity.                                 | No.                                                      |
| `authorized_by_user_id`  | Optional authorization reference.                                          | Yes; keep only if authorization is needed at this stage. |
| `created_at`             | System timestamp.                                                          | No.                                                      |

### `raw_material`

Represents the raw-material bale/fardo identity, original receipt evidence, and the one whole-bale delivery to Operation when it occurs. A bale is never partially delivered and is not linked to a production identity or finished-product lot.

| Field                                | Why it exists                                                                 | Optional / challenge later                                  |
| ------------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `raw_material_id`                    | Technical identifier for the raw-material record.                             | No.                                                         |
| `bale_number`                        | Visible bale/fardo identity used by Warehouse operators.                      | No; exact numbering format may change.                      |
| `raw_material_type`                  | What kind of raw material was received.                                       | No.                                                         |
| `yarn_count_label`                   | Snapshot of title/yarn-count wording known at reception.                      | Yes.                                                        |
| `color_or_fiber`                     | Color, fiber, or variant wording known at reception.                          | Yes.                                                        |
| `receipt_number`                     | Visible receipt reference when the business has one.                          | Yes; keep here unless separate receipt headers become real. |
| `business_received_at`               | Physical/business receipt time.                                               | No.                                                         |
| `supplier_name`                      | Supplier evidence without requiring a supplier catalog.                       | Yes; challenge once catalogs exist.                         |
| `received_weight_kg`                 | Quantity originally received for the bale.                                    | No.                                                         |
| `delivered`                          | Whether the whole bale was delivered to Operation.                             | No.                                                         |
| `delivered_at`                       | Business time of the whole-bale delivery to Operation.                         | Yes; required once delivered.                               |
| `delivered_by_user_id`               | Warehouse user who delivered the material to Operation.                       | Yes; required only once delivered.                          |
| `received_by_operation_user_id`      | Operation user who received the whole bale.                                   | Yes.                                                        |
| `received_by_user_id`                | Warehouse receiver at raw-material intake.                                    | No.                                                         |
| `condition_notes`                    | Physical condition or differences observed on the bale.                       | Yes.                                                        |
| `created_at`                         | System timestamp.                                                            | No.                                                         |

### `finished_product_receipts`

Represents finished product received by Warehouse from Operation under the existing shared production identity.

| Field                                              | Why it exists                                                                                          | Optional / challenge later                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `finished_product_receipt_id`                      | Technical identifier for the Warehouse receipt record.                                                 | No.                                                |
| `receipt_number`                                   | Visible Warehouse receipt number.                                                                      | No.                                                |
| `production_identity_id`                           | Keeps finished product tied to the existing production identity instead of creating a second identity. | No.                                                |
| `availability_state`                               | Warehouse readiness for distribution.                                                                  | No, but the state list may be reviewed.            |
| `physical_presentation`                            | Bagged/bulk or other physical form in Warehouse.                                                       | No for PT receipt; vocabulary may be reviewed.     |
| `business_received_at`                             | Business receipt time.                                                                                 | No.                                                |
| `received_by_user_id`, `origin_supervisor_user_id` | Warehouse receiver and Operation-side origin reference.                                                | Receiver no; origin supervisor optional.           |
| `delivery_condition_note`, `verification_notes`    | Differences, visible condition, or reception checks.                                                   | Yes.                                               |
| `created_at`                                       | System timestamp.                                                                                      | No.                                                |

### `finished_product_deliveries`

Represents Warehouse delivery of finished product to a customer or Commercialization.

| Field                                         | Why it exists                                                              | Optional / challenge later                              |
| --------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| `finished_product_delivery_id`                | Technical identifier.                                                      | No.                                                     |
| `delivery_number`                             | Visible Warehouse delivery number.                                         | No.                                                     |
| `delivery_type`                               | Minimal distinction between direct sale and transfer to Commercialization. | No, but challenge if one generic destination is enough. |
| `finished_product_receipt_id`                 | Identifies the received finished product being delivered.                  | No.                                                     |
| `business_delivered_at`                       | Business delivery time.                                                    | No.                                                     |
| `delivered_to_name`                           | Who received the product or destination area.                              | No.                                                     |
| `quantity_kg`                                 | Amount delivered.                                                          | No.                                                     |
| `commercial_document_number`                  | Invoice or commercial reference when applicable.                           | Yes.                                                    |
| `handled_by_user_id`, `authorized_by_user_id` | Delivery responsibility and optional authorization evidence.               | Handler no; authorization can be challenged.            |
| `notes`                                       | Delivery context or incidents.                                             | Yes.                                                    |
| `created_at`                                  | System timestamp.                                                          | No.                                                     |

### `finished_product_returns`

Represents basic registration of finished product returned from a Warehouse delivery. Each return records the returned quantity, allowing partial returns and restoring that quantity to Warehouse availability; it is not a separate return workflow.

| Field                          | Why it exists                                                                | Optional / challenge later |
| ------------------------------ | ---------------------------------------------------------------------------- | -------------------------- |
| `finished_product_return_id`   | Technical identifier.                                                        | No.                        |
| `finished_product_delivery_id` | Identifies the delivery from which the finished product was returned.        | No.                        |
| `returned_quantity_kg`         | Returned quantity; supports partial returns and restores Warehouse availability. | No.                     |
| `business_returned_at`         | Business return time.                                                        | No.                        |
| `received_by_user_id`          | Warehouse user who received the returned product.                            | No.                        |
| `created_at`                   | System timestamp.                                                            | No.                        |

### `supply_items`

Represents a supply that Warehouse can receive and deliver.

| Field             | Why it exists                                                 | Optional / challenge later                                                |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `supply_item_id`  | Technical identifier.                                         | No.                                                                       |
| `supply_code`     | Visible/internal item code.                                   | No if users need item recognition; challenge if names are enough for MVP. |
| `supply_name`     | Human-readable supply name.                                   | No.                                                                       |
| `supply_category` | Flexible category label without a separate catalog.           | No.                                                                       |
| `unit_of_measure` | Default unit for the item.                                    | No.                                                                       |
| `is_active`       | Keeps old items from being selected without deleting history. | Yes; challenge if premature.                                              |
| `created_at`      | System timestamp.                                             | No.                                                                       |

### `supply_receipts`

Represents supplies received by Warehouse.

| Field                      | Why it exists                                       | Optional / challenge later |
| -------------------------- | --------------------------------------------------- | -------------------------- |
| `supply_receipt_id`        | Technical identifier.                               | No.                        |
| `receipt_number`           | Visible receipt number.                             | No.                        |
| `supply_item_id`           | Supply received.                                    | No.                        |
| `business_received_at`     | Business receipt time.                              | No.                        |
| `received_from_name`       | Supplier or source name without a supplier catalog. | No for now.                |
| `quantity`                 | Amount received.                                    | No.                        |
| `unit_of_measure_snapshot` | Unit used at the time, preserved historically.      | No.                        |
| `received_by_user_id`      | Warehouse receiver.                                 | No.                        |
| `notes`                    | Incidents or context.                               | Yes.                       |
| `created_at`               | System timestamp.                                   | No.                        |

### `supply_deliveries`

Represents supplies delivered out of Warehouse.

| Field                      | Why it exists                                                     | Optional / challenge later |
| -------------------------- | ----------------------------------------------------------------- | -------------------------- |
| `supply_delivery_id`       | Technical identifier.                                             | No.                        |
| `delivery_number`          | Visible delivery number.                                          | No.                        |
| `supply_item_id`           | Supply delivered.                                                 | No.                        |
| `business_delivered_at`    | Business delivery time.                                           | No.                        |
| `delivered_to_name`        | Person, area, or production destination that received the supply. | No.                        |
| `quantity`                 | Amount delivered.                                                 | No.                        |
| `unit_of_measure_snapshot` | Unit used at the time, preserved historically.                    | No.                        |
| `delivered_by_user_id`     | Warehouse user who delivered it.                                  | No.                        |
| `received_by_name`         | Visible recipient name when no user/catalog exists.               | Yes.                       |
| `notes`                    | Incidents or context.                                             | Yes.                       |
| `created_at`               | System timestamp.                                                 | No.                        |

### `record_corrections`

Represents correction audit for Warehouse-owned records.

| Field                                  | Why it exists                                       | Optional / challenge later |
| -------------------------------------- | --------------------------------------------------- | -------------------------- |
| `record_correction_id`                 | Technical identifier.                               | No.                        |
| `record_table`, `record_id`            | Identifies the corrected Warehouse record.          | No.                        |
| `corrected_by_user_id`, `corrected_at` | Who corrected and when the correction was captured. | No.                        |
| `correction_reason`                    | Required business reason.                           | No.                        |
| `authorization_basis`                  | Policy or authorization basis when needed.          | Yes.                       |
| `before_values`, `after_values`        | Preserves audit evidence.                           | No.                        |
