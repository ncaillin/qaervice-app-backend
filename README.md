# qaervice-app-backend

The backend for the qaervice app

## Database structure

### Owner Table

id          | email | name | membership | stripeId  | passwordHash  |
--------    | ----- | ---- | ---------  | --------  |  -----------  |
int         | text  | text | text       | text      | text          |

### Employee Table

id | email  | passwordHash  | ownerId   | identifierStr | active    | photoId   | name  | 
---|---     |---            |---        |---            |---        |---        |---    |
int|text    |text           |int        |text           |bool       |int        |text   |


## Backend routes:

### POST
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

### POST
### /v2/misc/login

#### login for both employees and owners, adds id and type of user to session cookie

##### inputs
- name, email

##### method

- Checks email and password present in request
- strips whitespace and makes email lowercase
- Checks user Exists in DB under Employee or Owner table
- if exists, assign uid and type of user into session cookie


##### return codes

400 | 404 | 401 | 500 | 200 |
--- | --- | --- | --- | ---
Email or password missing | User not found | incorrect password |  More than 1 user found in DB | Login successful

### POST
### /v2/employee/create

#### send an email for the employee to register their account
##### input
- name
- email
##### requirements
- session token with type: Owner
##### method
- verify name, email present and valid
- verify session
- verify email not present in Employee or Owner table
- create identifierStr, ownerId + 40 random chars
- initialise user to DB with name, email, identifierStr, ownerId, active=false
- send registration email so employee can set password



##### response codes
201         | 400                   | 401                               |409                    |
----        |---                    | ---                               |---                    |
Email sent  |Name, or email missing | Session missing or not correct    |User exists with email |
&#xfeff;    |invalid email          |                                   |                       |

### PUT
### /v2/employee/setPassword

#### set the password for a new employee

##### inputs:
- identifierStr
- password
##### requirements
- password is at least 7 characters
- employee has active=false
##### method

- check inputs present
- check password valid
- verifies employee present in DB
- verifies active = false
- creates password hash
- modifies employee in DB to have passwordHash and active=true

##### response codes

200             |400                                |401                        |404                        |500
---             |---                                |---                        |---                        |---
Password set    |identifierStr or password missing  |active !== false           |Employee not found in DB   |error writing to DB
&#xfeff;        |password < 7 chars                 |                           |                           |more than 1 employee found





