package system.authz

import input
import data.basic as users_db

default allow = false


allow if {
    has_valid_credentials
}

has_valid_credentials if {
    auth := input.headers.Authorization[0]
    startswith(auth, "Basic ")
    creds := substring(auth, 6, -1)
    decoded := base64.decode(creds)
    [user, pass] := split(decoded, ":")
    user_data := [u | u := users_db[i]; u.user_id == user][0]
    user_data.password == pass
}