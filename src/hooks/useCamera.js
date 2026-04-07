import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useCamera — requests webcam access and returns stream + permission state.
 * The stream is automatically stopped when the component unmounts.
 */
const useCamera = () => {
    const [stream, setStream]           = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError]             = useState(null);
    const [isLoading, setIsLoading]     = useState(false);
    const streamRef = useRef(null);

    const requestCamera = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = mediaStream;
            setStream(mediaStream);
            setHasPermission(true);
        } catch (err) {
            setHasPermission(false);
            if (err.name === 'NotAllowedError') {
                setError('Camera access denied. Please allow camera access in your browser settings and try again.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera device found. Please connect a camera and try again.');
            } else {
                setError(`Camera error: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setStream(null);
            setHasPermission(false);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return { stream, hasPermission, error, isLoading, requestCamera, stopCamera };
};

export default useCamera;
