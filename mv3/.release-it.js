module.exports = {
    'git': {
        'requireCleanWorkingDir': true,
        'commitMessage': 'v${version}',
        'pushRepo': 'origin',
        'tagName': 'v${version}',
        'requireCommits': true,
    },
    'github': {
        'release': true,
        'releaseName': 'v${version}--chrome-mv3',
        'tokenRef': 'GITHUB_TOKEN',
        'autoGenerate': true,
        'web': true,
        'assets': ['releases/*-v${version}.zip'],
    },
    'npm': {
        'publish': false,
    },
    'hooks': {
        // bump version in the manifest.json to be the same as in the package.json
        'before:bump': ['dot-json src/manifest.json version "${version}"'],
        'after:bump': ['npm run build'],
        'after:release': [
            'echo Successfully released ${name} v${version} to ${repo.repository}',
        ],
    },
};
