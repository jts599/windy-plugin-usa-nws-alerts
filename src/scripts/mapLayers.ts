import { colorFromSeverity } from './alertUtils';
import type { DisplayedAlert } from './alertTypes';

/** Callback set used when Leaflet alert layers emit user interactions. */
export interface AlertLayerHandlers {
    onMouseOver: (alert: DisplayedAlert) => void;
    onMouseOut: (alert: DisplayedAlert) => void;
}

/** Styles and registers interaction handlers for a newly-created alert layer set. */
export function configureAlertLayers(alert: DisplayedAlert, handlers: AlertLayerHandlers): void {
    for (const layer of alert.layers) {
        layer.setStyle({
            className: 'nws-alert-layer',
            color: colorFromSeverity(alert.severity),
            weight: 2,
        });

        layer.on('mouseover', () => handlers.onMouseOver(alert));
        layer.on('mouseout', () => handlers.onMouseOut(alert));
    }
}

/** Adds an alert's layers to the map when they are not already visible. */
export function addAlertToMap(alert: DisplayedAlert, mapInstance: L.Map): void {
    if (alert.isAddedToMap) {
        return;
    }

    for (const layer of alert.layers) {
        layer.addTo(mapInstance);
    }
    alert.isAddedToMap = true;
}

/** Removes an alert's layers from the map while preserving registered handlers. */
export function removeAlertFromMap(alert: DisplayedAlert, mapInstance: L.Map): void {
    if (!alert.isAddedToMap) {
        return;
    }

    for (const layer of alert.layers) {
        layer.removeFrom(mapInstance);
    }
    alert.isAddedToMap = false;
}

/** Removes all alert layers and their event handlers from the map. */
export function removeAllAlertLayers(alerts: DisplayedAlert[], mapInstance: L.Map): void {
    for (const alert of alerts) {
        removeAlertHandlers(alert);
        removeAlertFromMap(alert, mapInstance);
    }
}

/** Highlights an alert's map layers and returns true when visible state changed. */
export function highlightAlertLayers(alert: DisplayedAlert): boolean {
    return setAlertHighlight(alert, true, 4);
}

/** Removes highlight styling from an alert's map layers and returns true when changed. */
export function unHighlightAlertLayers(alert: DisplayedAlert): boolean {
    return setAlertHighlight(alert, false, 2);
}

/** Removes all event handlers registered on an alert's Leaflet layers. */
function removeAlertHandlers(alert: DisplayedAlert): void {
    for (const layer of alert.layers) {
        layer.off();
    }
}

/** Applies the shared highlight style to visible alert layers. */
function setAlertHighlight(alert: DisplayedAlert, isHighlighted: boolean, weight: number): boolean {
    if (!alert.isAddedToMap) {
        return false;
    }

    for (const layer of alert.layers) {
        layer.setStyle({ weight });
    }
    alert.isHighlighted = isHighlighted;
    return true;
}
