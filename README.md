# qaervice-app-backend

The backend for the qaervice app

## Database structure

### Owner Table

id      | email | name | membership | stripeId | passwordHash
-------- | ----- | ---- | --------- | --------|  -----------
int      | text  | text | text      | text    | text 

### Employee Table

id | email | passwordHash | ownerId | identifierStr | active | photoId | name 
---|---|---|---|---|---|---|---|


## Backend routes:

### /v2/owner/register
#### register a new owner user.
##### inputs
name, email, password

##### Method
- Checks email, password and name exists, exits if any do not
- Strips whitespace from email and makes lower case
- validates email, and that password is at least 7 characters
- check email not in use in Employee or Owner table, exits if found
- creates password hash
- creates stripe customer
- adds stripe customer to free membership subscription
- writes to database

##### Return codes

400 | 409 | 500 | 201 |
--- | --- | --- | --- |
email, password or name missing | email found in DB |  in DB write | new user created
email invalid |   |     |    |
password less than 7 characters |   |    |     |

### /v2/misc/login

#### login for both employees and owners, adds id and type of user to session cookie

##### inputs
- name, email

##### method

- Checks email and password present in request
- strips whitespace and makes email lowercase
- Checks user Exists in DB under Employee or Owner table
- if exists, assign id and type of user into session cookie


##### return codes

400 | 404 | 401 | 500 | 200 |
--- | --- | --- | --- | ---
Email or password missing | User not found | incorrect password |  More than 1 user found in DB | Login successful
