import {
    ExecutionContext,
    ContextBindings,
    ContextBindingData,
    TraceContext,
    BindingDefinition,
    Logger,
    HttpRequest,
} from "@azure/functions";
import {
    DurableOrchestrationBindingInfo,
    DurableOrchestrationContext,
    HistoryEvent,
    HistoryEventOptions,
    IOrchestratorState,
    OrchestratorStartedEvent,
} from "./classes";
import { IOrchestrationFunctionContext } from "./iorchestrationfunctioncontext";
import { ReplaySchema } from "./replaySchema";
import { TaskOrchestrationExecutor } from "./taskorchestrationexecutor";

/**
 * An orchestration context with dummy default values to facilitate mocking/stubbing the
 * Durable Functions API.
 */
export class DummyOrchestrationContext implements IOrchestrationFunctionContext {
    /**
     * Creates a new instance of a dummy orchestration context.
     * All parameters are optional but are exposed to enable flexibility
     * in the testing process.
     *
     * @param instanceId The instanceId of the orchestration
     * @param history The history events array of the orchestration
     * @param input The input to the orchestration
     * @param currentUtcDateTime The deterministic date at the beginning of orchestration replay
     * @param isReplaying Whether the orchestration is to be marked as isReplaying the its first event
     * @param longRunningTimerIntervalDuration The duration to break smaller timers into if a long timer exceeds the maximum allowed duration
     * @param maximumShortTimerDuration The maximum duration for a timer allowed by the underlying storage infrastructure
     * @param schemaVersion The schema version currently used after being negotiated with the extension
     * @param parentInstanceId The instanceId of the orchestration's parent, if this is a sub-orchestration
     */
    constructor(
        instanceId = "",
        history: HistoryEvent[] | undefined = undefined,
        input: any = undefined,
        currentUtcDateTime: Date = new Date(),
        longRunningTimerIntervalDuration: string,
        maximumShortTimerDuration: string,
        schemaVersion: ReplaySchema,
        isReplaying = false,
        parentInstanceId = ""
    ) {
        if (history === undefined) {
            const opts = new HistoryEventOptions(0, new Date());
            history = [new OrchestratorStartedEvent(opts)];
        }
        this.bindings = [new DurableOrchestrationBindingInfo(history)];
        this.df = new DurableOrchestrationContext(
            history,
            instanceId,
            currentUtcDateTime,
            isReplaying,
            parentInstanceId,
            longRunningTimerIntervalDuration,
            maximumShortTimerDuration,
            schemaVersion,
            input,
            new TaskOrchestrationExecutor()
        );
    }
    public doneValue: IOrchestratorState | undefined;
    public err: string | Error | null | undefined;
    df: DurableOrchestrationContext;
    invocationId: string;
    executionContext: ExecutionContext;
    bindings: ContextBindings;
    bindingData: ContextBindingData;
    traceContext: TraceContext;
    bindingDefinitions: BindingDefinition[];
    log: Logger;
    done(err?: string | Error, result?: any): void {
        this.doneValue = result;
        this.err = err;
    }
    req?: HttpRequest;
    res?: { [key: string]: any };
}
