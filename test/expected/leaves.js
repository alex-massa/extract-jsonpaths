export const paths = set([
    '$.id',
    '$.name',
    '$.metadata.createdAt',
    '$.metadata.tags[*]',
    '$.metadata.status.active',
    '$.metadata.status.verified',
    '$.metadata.status.history[*]',
    '$.metadata.status.history[*].date',
    '$.metadata.status.history[*].status',
    '$.details.attributes.weight',
    '$.details.attributes.height',
    '$.details.attributes.dimensions.length',
    '$.details.attributes.dimensions.width',
    '$.details.attributes.dimensions.depth',
    '$.details.attributes.colors[*]',
    '$.details.attributes.material.primary',
    '$.details.attributes.material.secondary',
    '$.details.locations[*].country',
    '$.details.locations[*].city',
    '$.details.locations[*].coordinates.latitude',
    '$.details.locations[*].coordinates.longitude',
    '$.users[*].userId',
    '$.users[*].preferences.notifications.email',
    '$.users[*].preferences.notifications.sms',
    '$.users[*].preferences.theme',
    '$.users[*].preferences.bookmarks[*].title',
    '$.users[*].preferences.bookmarks[*].url',
    '$.audit.log[*].entryId',
    '$.audit.log[*].action',
    '$.audit.log[*].timestamp',
    '$.audit.log[*].details.actor',
    '$.audit.log[*].details.reason',
    '$.audit.log[*].details.changes[*].field',
    '$.audit.log[*].details.changes[*].oldValue',
    '$.audit.log[*].details.changes[*].newValue',
    '$.settings.privacy.policyAccepted',
    '$.settings.privacy.lastUpdated',
    '$.settings.preferences.language',
    '$.settings.preferences.timezone',
    '$.settings.preferences.appearance.theme',
    '$.settings.preferences.appearance.contrast'
]);
