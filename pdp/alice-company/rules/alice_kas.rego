package alice.kas

import future.keywords.if
import future.keywords.in

# ------------------------------------------------------

# Deny by default
default allow := false

allow if {
    input.endpoint in ["kas/rewrap"]
    some attribute in input.policy.body.dataAttributes
    attribute.team == input.authentication.customClaims.team
}

allow if {
    input.endpoint in ["kas/encrypt", "kas/decrypt"]
}
