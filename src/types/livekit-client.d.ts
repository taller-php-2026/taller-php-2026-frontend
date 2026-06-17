declare module 'livekit-client' {
  export enum RoomEvent {
    Connected = 'connected',
    Disconnected = 'disconnected',
    TrackSubscribed = 'trackSubscribed',
    TrackUnsubscribed = 'trackUnsubscribed',
    LocalTrackPublished = 'localTrackPublished',
  }

  export namespace Track {
    export enum Kind {
      Audio = 'audio',
      Video = 'video',
    }
  }

  export interface RemoteParticipant {
    identity: string;
    name?: string;
  }

  export interface RemoteTrackPublication {
    kind: Track.Kind;
  }

  export interface RemoteTrack {
    kind: Track.Kind;
    attach(element?: HTMLMediaElement): HTMLMediaElement;
    detach(element?: HTMLMediaElement): HTMLMediaElement[];
  }

  export interface LocalTrackPublication {
    track?: RemoteTrack;
  }

  export class Room {
    localParticipant: {
      setMicrophoneEnabled(enabled: boolean): Promise<void>;
      setCameraEnabled(enabled: boolean): Promise<void>;
    };

    connect(url: string, token: string): Promise<void>;
    disconnect(): void;
    on(event: RoomEvent.Connected, callback: () => void): this;
    on(event: RoomEvent.Disconnected, callback: () => void): this;
    on(
      event: RoomEvent.TrackSubscribed,
      callback: (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant,
      ) => void,
    ): this;
    on(event: RoomEvent.TrackUnsubscribed, callback: (track: RemoteTrack) => void): this;
    on(event: RoomEvent.LocalTrackPublished, callback: (publication: LocalTrackPublication) => void): this;
  }
}
