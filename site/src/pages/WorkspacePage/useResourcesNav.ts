import type { WorkspaceResource } from "api/typesGenerated";
import { useEffectEvent } from "hooks/hookPolyfills";
import { useSearchParamsKey } from "hooks/useSearchParamsKey";
import { useCallback, useEffect } from "react";

export const resourceOptionValue = (resource: WorkspaceResource) => {
	return `${resource.type}_${resource.name}`;
};

// TODO: This currently serves as a temporary workaround for synchronizing the
// resources tab during workspace transitions. The optimal resolution involves
// eliminating the sync and updating the URL within the workspace data update
// event in the WebSocket "onData" event. However, this requires substantial
// refactoring. Consider revisiting this solution in the future for a more
// robust implementation.
export const useResourcesNav = (resources: WorkspaceResource[]) => {
	const resourcesNav = useSearchParamsKey({ key: "resources" });
	const isSelected = useCallback(
		(resource: WorkspaceResource) => {
			return resourceOptionValue(resource) === resourcesNav.value;
		},
		[resourcesNav.value],
	);

	const onResourceChanges = useEffectEvent(
		(resources?: WorkspaceResource[]) => {
			const hasSelectedResource = resourcesNav.value !== "";
			const hasResources = resources && resources.length > 0;
			const hasResourcesWithAgents =
				hasResources && resources[0].agents && resources[0].agents.length > 0;

			if (!hasSelectedResource && hasResourcesWithAgents) {
				resourcesNav.setValue(resourceOptionValue(resources[0]));
			}
		},
	);
	useEffect(() => {
		onResourceChanges(resources);
	}, [onResourceChanges, resources]);

	const select = useCallback(
		(resource: WorkspaceResource) => {
			resourcesNav.setValue(resourceOptionValue(resource));
		},
		[resourcesNav],
	);

	return {
		isSelected,
		select,
		value: resourcesNav.value,
	};
};
